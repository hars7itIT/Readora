# Testing Rules

- **Coverage Focus Areas**:
  1. SSRF prevention tests (rejection of localhost, private IPs, non-standard ports, invalid schemes, credentialed URLs).
  2. Feed parsing accuracy (RSS 2.0, Atom 1.0, malformed XML handling).
  3. Article sanitization (DOMPurify stripping `<script>`, `<iframe>`, malicious attributes like `onload`/`onerror`).
  4. Local cache & offline fallback (Dexie IndexedDB CRUD, persistence when network is offline).
  5. Discovery logic (pairwise score generation and popular ranking).
- **Test Runners**:
  - Server: Node.js built-in test runner (`node --test`) or custom test suites.
  - Client: Unit tests with mock DOM and XML fixtures.
