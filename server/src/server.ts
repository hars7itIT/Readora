import { config } from './config/env.js';
import { initDatabase } from './config/database.js';
import { seedDiscoveryDatabase } from './seed/seed.js';
import { createApp } from './app.js';

async function start() {
  const db = await initDatabase();
  if (db) {
    try {
      await seedDiscoveryDatabase(db);
      console.log('🌱 Seeded discovery database.');
    } catch (err) {
      console.error('⚠️ Could not seed discovery data:', err);
    }
  }

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Small Web Reader API listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
