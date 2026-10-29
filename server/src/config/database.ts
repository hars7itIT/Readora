import { MongoClient, type Db } from 'mongodb';
import { config } from './env.js';

let client: MongoClient | undefined;
let db: Db | undefined;

export async function initDatabase(): Promise<Db | undefined> {
  if (!config.mongoUri) {
    console.warn('⚠️ MONGODB_URI not configured. Discovery features will run in unpersisted or offline mode.');
    return undefined;
  }
  try {
    client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    db = client.db(config.mongoDb);
    console.log(`✅ Connected to MongoDB: ${config.mongoDb}`);
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err instanceof Error ? err.message : err);
    return undefined;
  }
}

export function getDatabase(): Db | undefined {
  return db;
}

export function isDbConnected(): boolean {
  return Boolean(db);
}
