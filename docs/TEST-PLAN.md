# Test Plan

## 1. Unit Tests
- **SSRF Test Suite** (`server/tests/fetch.security.test.ts`):
  - Attempt fetch to `http://127.0.0.1` -> expect 400 Bad Request.
  - Attempt fetch to `http://localhost:8080` -> expect 400 Bad Request.
  - Attempt fetch to `http://169.254.169.254` (metadata service) -> expect 400 Bad Request.
  - Attempt fetch with user credentials `http://user:pass@example.com` -> expect 400 Bad Request.
  - Attempt fetch with non-standard port `http://example.com:8443` -> expect 400 Bad Request.
- **Feed Normalization & Discovery Suite** (`server/tests/discovery.test.ts` & `recommendation.test.ts`):
  - Normalization of query params, schemes, trailing slashes.
  - Jaccard-like co-occurrence ranking calculation.
- **Client Parsing & Sanitization Tests** (`client/tests/`):
  - Feed parser parsing valid RSS 2.0 and Atom 1.0.
  - Feed parser failing safely on malformed XML.
  - DOMPurify removing `<script>` and `<iframe>` while preserving clean formatting.

## 2. Integration & Smoke Tests
- `scripts/check-env.mjs`: Validates all environment variables and paths.
- `scripts/smoke-test.mjs`: Fires requests to health and fetch endpoints.
