# Workflow: Run Quality Checks

1. **TypeScript Build**:
   ```bash
   npm run build -w client
   npm run build -w server
   ```
2. **Server Tests**:
   ```bash
   npm test -w server
   ```
3. **Environment & Health Checks**:
   ```bash
   node scripts/check-env.mjs
   node scripts/smoke-test.mjs
   ```
