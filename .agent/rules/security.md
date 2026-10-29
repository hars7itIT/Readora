# Security Rules & SSRF Defenses

## 1. SSRF Boundary Enforcement (`safeFetch`)
- **Scheme Restriction**: Permit ONLY `http:` and `https:`. Reject `file:`, `ftp:`, `data:`, `gopher:`, etc.
- **Credential Stripping**: Reject any URL containing username/passwords in the authority (`user:pass@host`).
- **Standard Ports**: Reject non-standard ports (strictly `80` for HTTP, `443` for HTTPS).
- **DNS Pinning**: Always resolve DNS upfront via `dns.lookup({ all: true, verbatim: true })`.
- **IP Address Validation**:
  - Parse every resolved IP with `ipaddr.js`.
  - Ensure `ip.range() === 'unicast'`. Reject loopback (`127.0.0.0/8`, `::1`), private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local (`169.254.0.0/16`, `fe80::/10`), CGNAT (`100.64.0.0/10`), documentation, and multicast.
  - Pin the validated IP to the outbound socket using the custom `lookup` agent option to prevent DNS rebinding (TOCTOU).
- **Redirect Revalidation**: Do NOT follow redirects automatically in HTTP agents. Manually inspect `301`, `302`, `303`, `307`, `308`, validate the new `Location` URL through the entire DNS + IP check pipeline, and cap redirects to 3 hops maximum.
- **Resource Constraints**: Maximum response body size 2 MB; strict 9000 ms timeout.

## 2. Client-Side Sanitization
- All parsed feed summaries and extracted article HTML MUST pass through DOMPurify with strict profiles before rendering.
- Forbid dangerous elements: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<style>`.

## 3. Privacy & Discovery Anonymity
- Opt-in required: No background or silent reporting. Submissions happen solely upon explicit user consent and action.
- Discovery submissions only increment aggregate frequency counters (`feed_counts`) and co-occurrence pair counters (`feed_pairs`).
