import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

console.log('🔍 Checking environment configuration...');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = fs.existsSync(path.join(process.cwd(), 'server'))
  ? process.cwd()
  : path.resolve(__dirname, '..');

const serverEnvPath = path.join(projectRoot, 'server', '.env');
const clientEnvPath = path.join(projectRoot, 'client', '.env');

let valid = true;

if (!fs.existsSync(serverEnvPath)) {
  console.warn(`⚠️  server/.env is missing at ${serverEnvPath}. Run: Copy-Item server/.env.example server/.env`);
  valid = false;
} else {
  console.log(`✅ server/.env found at ${serverEnvPath}`);
}

if (!fs.existsSync(clientEnvPath)) {
  console.warn(`⚠️  client/.env is missing at ${clientEnvPath}. Run: Copy-Item client/.env.example client/.env`);
  valid = false;
} else {
  console.log(`✅ client/.env found at ${clientEnvPath}`);
}

if (valid) {
  console.log('🎉 Environment check passed.');
  process.exit(0);
} else {
  console.error('❌ Environment check failed with warnings.');
  process.exit(1);
}
