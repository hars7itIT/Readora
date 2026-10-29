# Coding Standards

- **TypeScript Strictness**: Strict mode enabled across all packages. Avoid `any` whenever possible; use strong types or generics.
- **ES Modules**: Use modern ESM (`import` / `export`). Ensure file extensions match NodeNext resolution in server code (`.js` relative imports).
- **Functional & React Best Practices**:
  - React 18 functional components with hooks.
  - Proper dependency arrays in `useEffect`, `useCallback`, `useMemo`.
  - Accessible HTML markup, clean ARIA attributes, semantic tags (`<header>`, `<main>`, `<article>`, `<aside>`).
- **Error Handling**: Graceful error degradation. A single failing feed or unreachable article should never crash the reader shell or timeline.
