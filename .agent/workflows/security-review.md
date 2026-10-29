# Workflow: Security Review

1. **SSRF Audit**:
   - Inspect `server/src/services/safeFetch.service.ts` and `urlValidation.service.ts`.
   - Verify that all redirects re-enter DNS resolution and IP range validation.
   - Verify that loopback and private subnets are strictly blocked.
2. **XSS & Content Sanitization**:
   - Inspect `client/src/features/articles/articleSanitizer.ts`.
   - Ensure DOMPurify options prevent script execution, iframe injection, and style exploitation.
3. **Privacy Audit**:
   - Verify that client IP addresses are not logged, saved in databases, or correlated with user activity.
   - Confirm opt-in consent flow is respected before `/api/discovery/subscriptions` is triggered.
