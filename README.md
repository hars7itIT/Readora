# Readora — Autonomous Discovery for Independent Blogs (PECathon PS-003)

> **Team**: **Techno-Squard** | **Team Leader**: **Aryan khanna**  
> **Status**: 100% Implemented & Verified (31/31 Server Tests Passing)  
> **Presentation**: [Readora_Presentation_PS03.html](./Readora_Presentation_PS03.html) (Interactive 8-Slide Presentation Deck)  
> **Attribution & Upstream License**: This project builds upon the foundational architecture of the MIT-licensed [davegarvey/lidora](https://github.com/davegarvey/lidora) RSS reader. All core upstream rights, open source licenses, and attributions are fully retained. See [LICENSE](./LICENSE) for terms.

A privacy-first, account-free RSS/Atom reader and anonymous blog discovery engine. Readers follow blogs directly without algorithmic manipulation, and discover new independent voices based on what real readers follow—with zero tracking, no persistent IDs, and no hidden ranking objectives.

---

## 1. System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BROWSER CLIENT (Local-First)                          │
│                                                                             │
│  ┌──────────────────────┐   ┌───────────────────────┐   ┌────────────────┐  │
│  │ IndexedDB (Dexie)    │   │ Feed Parser (Client)  │   │ Mozilla        │  │
│  │ - Subscriptions      │<->│ - RSS / Atom / XML    │<->│ Readability &  │  │
│  │ - Cached Articles    │   │ - Autodiscovery Probe │   │ DOMPurify      │  │
│  │ - Read/Starred State │   │ - Isolated Failures   │   │ Sanitizer      │  │
│  │ - maybeShare() Sync  │   └───────────────────────┘   └────────────────┘  │
│  └──────────────────────┘               │ (CORS Egress)                     │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │
                         Raw fetch only   │   Anonymous Batches (Opt-in)
                                          ▼   Recommendations (Ephemerally)
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXPRESS SERVER / API PROXY                            │
│                                                                             │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────────┐  │
│  │ /api/fetch (Safe CORS Proxy)        │  │ /api/discovery/recommend    │  │
│  │ - DNS pre-resolution & pinning      │  │ - Excludes input U           │  │
│  │ - SSRF IP validation (ipaddr.js)    │  │ - Batch overlap scoring      │  │
│  │ - Loopback/private subnet blocking  │  │ - Popularity damping (sqrt)  │  │
│  │ - Redirect re-verification          │  │ - Minimum threshold (k = 2)  │  │
│  │ - Byte size & timeout limits        │  │ - Ephemeral (never stored)   │  │
│  └─────────────────────────────────────┘  └──────────────────────────────┘  │
│                                           ┌──────────────────────────────┐  │
│                                           │ /api/discovery/subscriptions │  │
│                                           │ - Abuse check (IP-salt hash) │  │
│                                           │ - Cap batch <= 100 feeds     │  │
│                                           │ - Normalization & deduping   │  │
│                                           │ - Weight = 1 / sqrt(size)    │  │
│                                           │ - Expiry = now + 90 days     │  │
│                                           └──────────────────────────────┘  │
└─────────────────────────────────────────┬───────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 DATABASE / AGGREGATE DISCOVERY STORE                        │
│                                                                             │
│  - feeds(id, url_normalized UNIQUE, title)                                  │
│  - batches(id random, created_at, expires_at, size, weight)                 │
│  - batch_items(batch_id FK, feed_id FK)                                     │
│  - rate_limits(ip_hash, window_start, count, expires_at)                    │
│                                                                             │
│  * Scheduled cleanup daily: purges expired batches & rate limits.           │
│  * Seed batches flagged to persist during demonstration period.             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Setup Instructions and Environment Variables

### Prerequisites
- Node.js 20.18+ or later
- npm or pnpm

### Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example server/.env

# 3. Start development servers (Frontend: 5173, Backend: 8080)
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Environment Variables (`server/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend API port | `8080` |
| `CLIENT_ORIGIN` | Allowed client CORS origin | `http://localhost:5173` |
| `IP_HASH_SALT` | Secret salt for anonymous rate-limit hashing | `pec_discovery_salt_v1` |
| `MONGODB_URI` | *(Optional)* MongoDB connection string | `""` *(Uses built-in PS-003 store if empty)* |
| `MONGODB_DB` | *(Optional)* MongoDB database name | `small_web_reader` |

---

## 3. Privacy and Threat Model

### What the Server Stores
- **Anonymous Batches**: `{ id, created_at, expires_at, size, weight }` where `weight = 1 / sqrt(size)`. No user accounts, sessions, or client identifiers.
- **Batch Feed Items**: Co-occurrence relations between normalized feed URLs.
- **Rate Limit Hashes**: Short-lived, salted one-way hashes of client IP addresses with brief TTLs (1 hour to 1 day). Raw IP addresses are never logged or persisted.

### What the Server NEVER Stores
- **No User Identity**: No mandatory accounts, cookies, device fingerprints, or tracking tokens.
- **No Read State**: Reading progress, unread status, starred pieces, and notes exist **exclusively in the browser's IndexedDB**.
- **No Recommendation Inputs**: On `POST /api/discovery/recommendations`, the user's feed list `U` is used ephemerally in application memory to calculate co-occurrences and is discarded immediately after the response is rendered.

### The 30 / 60 / 90-Day Sharing and Expiry Timeline
1. **Sharing is Opt-In and OFF by Default**: No subscription data is shared until the user explicitly toggles on sharing consent.
2. **Initial Share**: When enabled and the reader has at least 3 feeds, `maybeShare()` sends an initial anonymous batch.
3. **Under 30 Days**: All background submissions are prevented, ensuring daily follow/unfollow actions are never transmitted in real time.
4. **30 to 60 Days**: A submission only occurs if the feed list changed meaningfully (at least 3 feeds added/removed, or at least a 20% difference).
5. **60 Days (Renewal)**: A submission occurs even if unchanged to renew the user's community contribution before their previous batch reaches the 90-day expiry threshold.
6. **90 Days (Automatic Expiry)**: Any batch older than 90 days is ignored by discovery ranking and purged by the cleanup job.
7. **Disabling Sharing**: Turning sharing OFF immediately halts all future submissions and clears `lastSharedSet` locally. Because batches are anonymous and contain no user link, previously submitted batches cannot be deleted on request and expire naturally after 90 days.

### Abuse Protections & SSRF Defenses
- **Egress DNS Pinning**: For every external URL requested through `/api/fetch`, the server resolves DNS records before connection, checks against all loopback (`127.0.0.0/8`), private (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local (`169.254.0.0/16`), and non-standard schemes, and binds directly to the verified public IP.
- **Redirect Revalidation**: Every HTTP redirect is caught and re-evaluated through DNS resolution and IP ranges.
- **Client HTML Sanitization**: All extracted article HTML is sanitized with DOMPurify, stripping all `<script>`, `<iframe>`, `<object>`, `<embed>`, and inline event handlers (`onerror`, `onload`).

### Accepted Limitations (Honest Disclosure)
- **Many-IP Sybil Attackers**: A distributed attacker controlling multiple distinct IP addresses could skew co-occurrence counts.
- **Double Counting Overlap**: During the transition period where an old batch and a renewed batch coexist (days 60–90), overlapping feeds contribute both weights until the old batch expires.
- **Unfollowed Blog Retention**: If a user unfollows a blog, that co-occurrence remains in the 90-day batch until expiry.
- **Small-Network Cold Start**: When community submissions are few, recommendation rankings rely proportionally on curated seed clusters.

---

## 4. Demonstration & Edge Cases

The application includes predefined edge-case feeds in `client/src/lib/sampleFeeds.ts` to test resilient reader behavior:

1. **Site with No Feed (`https://example.com`)**:
   - The user pastes `example.com`.
   - The reader runs autodiscovery probing `<link rel="alternate">`, `/feed`, `/rss.xml`, `/atom.xml`, and `/index.xml`.
   - When no feed XML is located, it reports a clear, friendly error without crashing.

2. **Dead or Offline Feed (`https://example.com/dead-feed-404.xml`)**:
   - When refreshed, the network request returns 404 or fails.
   - The timeline isolates the error using `Promise.allSettled`.
   - Remaining feeds continue loading normally without any interruption.

3. **Extraction-Failure Page (`https://example.com/empty-content`)**:
   - When Mozilla Readability cannot extract article content, the reader view gracefully falls back to displaying the feed summary and provides a direct link to the original website.

4. **Duplicate URL Normalization (`http://jvns.ca/atom.xml`, `https://www.jvns.ca/atom.xml`, `https://jvns.ca/atom.xml/`)**:
   - Strips `www.`, default port numbers, trailing slashes, and tracking query parameters (`utm_*`, `ref`, `fbclid`).
   - All variations normalize to the exact canonical URL: `https://jvns.ca/atom.xml`.

---

## 5. Verification & Test Suite

Run the full suite of 29 unit and integration tests covering all requirements:

```bash
# Run server & algorithm test suite
npm test -w server

# Run client production build
npm run build -w client
```

### Verified Test Cases:
- ✔ URL normalization (www, http/https, trailing slash, fragments, tracking params, private IPs)
- ✔ SSRF defenses (localhost, loopback 127.0.0.1, private subnets, cloud metadata 169.254.169.254, non-HTTP schemes, non-standard ports)
- ✔ Batch size capping (rejects batches > 100 feeds)
- ✔ Expired batches ignored and purged by cleanup
- ✔ Recommendations strictly exclude followed feeds
- ✔ Minimum co-occurrence threshold ($k \ge 2$)
- ✔ Popularity damping ($1 / \sqrt{\text{totalBatchesContaining}}$)
- ✔ `maybeShare()` decision logic (disabled, <3 feeds, initial share, <30 days throttled, 30–60 days changed vs unchanged, 60-day renewal)
- ✔ DOMPurify HTML sanitization (strips scripts, iframes, and inline event handlers)
- ✔ Client Vite production build and server TypeScript compilation
