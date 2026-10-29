# Threat Model & Security Posture

## Identified Threats & Mitigations

### 1. Server-Side Request Forgery (SSRF)
- **Threat**: Attacker specifies internal URLs (e.g. `http://localhost:6379`, `http://192.168.1.1/admin`, `http://169.254.169.254/latest/meta-data`) to probe or compromise internal infrastructure.
- **Mitigation**:
  - Scheme restriction: Only `http:` and `https:`.
  - DNS pre-resolution and parsing with `ipaddr.js`.
  - Rejection of all non-unicast ranges (private, loopback, link-local, multicast, reserved).
  - Pinned IP lookup to thwart DNS rebinding.
  - Redirect handling validates target URL before following.
  - Port limitation: strictly ports 80 and 443.

### 2. Cross-Site Scripting (XSS) via Feed Content
- **Threat**: Malicious blog posts containing `<script>` or inline event handlers (`onload`, `onerror`) executed in the reader context.
- **Mitigation**:
  - Full DOMPurify sanitization with strict allowlist.
  - Content Security Policy header on raw fetch proxy (`default-src 'none'; sandbox`).

### 3. Resource Exhaustion / Denial of Service
- **Threat**: Attacker sends requests to gigabyte-sized files (decompression bombs, infinite streams).
- **Mitigation**:
  - Hard cap of 2 MB on HTTP response streams; immediate abort upon exceeding.
  - 9-second timeout per fetch.
  - Rate limiting on proxy and discovery endpoints.

### 4. User Privacy & Tracking
- **Threat**: Server correlating user IP with specific reading habits or subscriptions.
- **Mitigation**:
  - No user accounts or cookies.
  - Subscription submissions are strictly opt-in, batch-aggregated into global counters, and never tied to user identifiers.
