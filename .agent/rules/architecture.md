# Architecture Rules

## Guiding Principles

1. **Local-First & Client-Side Heavy**:
   - RSS/Atom parsing, full-text extraction (Readability), HTML sanitization (DOMPurify), and storage (IndexedDB via Dexie) are strictly performed in the user's browser.
   - The backend server is a minimalist, untrusted proxy & discovery facilitator.

2. **Zero-Knowledge Backend**:
   - The backend `/api/fetch` proxy NEVER parses, logs, or persists feed content or article bodies. It streams or returns raw bytes/text directly.
   - Discovery endpoints (`/api/discovery/*`) only collect aggregate counts and pairwise co-subscriptions. No client accounts, user IDs, device fingerprints, or per-user subscription lists exist or are recorded.

3. **Layered Separation of Concerns**:
   - **Routes**: Request mapping, HTTP status translation.
   - **Controllers**: Parameter extraction, calling service methods, formatting responses.
   - **Services**: Business logic, security validations, network interaction.
   - **Models**: Data shapes for MongoDB collections.
   - **Middleware**: Rate limiting, security headers, request validation, error boundaries.
