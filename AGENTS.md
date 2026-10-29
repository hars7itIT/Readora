# Small Web Reader — Agent Guidelines

Welcome to the Small Web Reader codebase. When assisting or developing in this repository, follow these rules:

1. **Security & SSRF are Paranoid-Level Priorities**:
   - The fetch proxy endpoint (`/api/fetch`) must never allow requests to loopback addresses, private networks, cloud metadata services (e.g. `169.254.169.254`), or non-standard ports.
   - Pinned IP resolution must always be maintained across redirects.
   - Never disable or weaken DOMPurify sanitization.

2. **Zero-Knowledge Principle**:
   - Do not add user accounts, JWT tokens, session cookies, or device fingerprinting.
   - The reader must function fully offline once feeds are cached in IndexedDB.
   - Discovery data must remain strictly aggregated counters (`feed_counts` and `feed_pairs`).

3. **Workspace Organization**:
   - `client`: React 18, Vite, Dexie (IndexedDB), Readability, DOMPurify, Lucide icons.
   - `server`: Express, Helmet, CORS, Rate Limit, Safe Fetch, MongoDB driver.
   - `shared`: Common API types, schemas, and protocol constants.
   - `docs`: Architecture, API specifications, Threat model, Test plan, and Demo script.
   - `scripts`: Environment validation and smoke testing.
