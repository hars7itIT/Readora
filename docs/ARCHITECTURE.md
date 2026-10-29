# Architecture Overview

## High-Level Design

```text
┌────────────────────────────────────────────────────────┐
│                      Web Browser                       │
│  ┌───────────────┐     ┌──────────────┐     ┌────────┐ │
│  │ Dexie (IDB)   │ <-> │ Parser &     │ <-> │ UI &   │ │
│  │ Local Cache   │     │ Readability  │     │ Router │ │
│  └───────────────┘     └──────────────┘     └────────┘ │
└───────────────────────────┬────────────────────────────┘
                            │ (Raw feed/article fetch)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express API Proxy                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ SafeFetch Service (DNS Pinning, SSRF Protection) │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Discovery Controller (Opt-In Aggregates Only)    │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ (Aggregate counts only)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   MongoDB Commons DB                   │
│   - feed_counts (url, count, title)                    │
│   - feed_pairs  (a, b, count)                          │
└────────────────────────────────────────────────────────┘
```

## Key Invariants

1. **Client Sovereignty**: Feeds, articles, reading positions, read/unread flags, and bookmarks live entirely inside the user's IndexedDB. The backend holds no user state.
2. **Safe Fetch Proxy**: The backend is an egress proxy for feeds and articles to bypass CORS safely while actively filtering SSRF, internal network pivots, and malicious payload sizes.
3. **Aggregate Discovery**: Suggestions are derived solely from co-occurrence scores between feeds submitted by users who explicitly chose to share anonymously.
