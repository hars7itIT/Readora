import fs from 'node:fs';
import path from 'node:path';
import { getDatabase } from '../config/database.js';
import type { User, Session, PasswordResetToken } from '../models/User.model.js';
import { hashToken } from '../utils/security.js';

interface InMemoryAuthData {
  users: Record<string, User>; // email -> User
  sessions: Record<string, Session>; // tokenHash -> Session
  passwordResets: Record<string, PasswordResetToken>; // tokenHash -> PasswordResetToken
}

// Fallback persistence file path for development when MongoDB is not running
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DATA_FILE = path.join(DATA_DIR, 'auth_fallback.json');

let memoryStore: InMemoryAuthData = {
  users: {},
  sessions: {},
  passwordResets: {}
};

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Ignore in read-only environments
  }
}

function loadFallbackData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.users) memoryStore.users = parsed.users;
      if (parsed.sessions) memoryStore.sessions = parsed.sessions;
      if (parsed.passwordResets) memoryStore.passwordResets = parsed.passwordResets;
    }
  } catch {
    // Start fresh on read errors
  }
}

const DEMO_USER_EMAIL = 'demo@readora.com';
const DEMO_USER_HASH =
  'scrypt:a1b2c3d4e5f60718293a4b5c6d7e8f90:0b8bc7b1ba379d8c589d24cc66551e43d7fcd7354203726b32ad04aede492d3d1f1c7153dbfcbf83d5f4cb17d7c676cb19bdfb1a75efac4852c959e8975aa59d';

function ensureDemoUser() {
  if (!memoryStore.users[DEMO_USER_EMAIL]) {
    const now = new Date();
    memoryStore.users[DEMO_USER_EMAIL] = {
      _id: 'demo-user-id-readora',
      email: DEMO_USER_EMAIL,
      passwordHash: DEMO_USER_HASH,
      name: 'Demo Reader',
      createdAt: now,
      updatedAt: now,
      syncEnabled: true,
      syncedFeeds: [
        'https://jvns.ca/atom.xml',
        'https://css-tricks.com/feed/',
        'https://code.blogger.com/feeds/posts/default'
      ]
    };
  }
}

function saveFallbackData() {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch {
    // Ignore save errors in ephemeral environments
  }
}

loadFallbackData();
ensureDemoUser();

export async function createUser(user: User): Promise<User> {
  const db = getDatabase();
  const normalizedEmail = user.email.toLowerCase().trim();
  const userToSave: User = { ...user, email: normalizedEmail };

  if (db) {
    const col = db.collection<User>('users');
    await col.createIndex({ email: 1 }, { unique: true }).catch(() => {});
    await col.insertOne(userToSave);
    return userToSave;
  }

  // Memory/file fallback
  if (memoryStore.users[normalizedEmail]) {
    const error: any = new Error('User already exists');
    error.code = 11000;
    throw error;
  }
  memoryStore.users[normalizedEmail] = userToSave;
  saveFallbackData();
  return userToSave;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = getDatabase();

  if (db) {
    const col = db.collection<User>('users');
    return await col.findOne({ email: normalizedEmail });
  }

  return memoryStore.users[normalizedEmail] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = getDatabase();

  if (db) {
    const col = db.collection<User>('users');
    return await col.findOne({ _id: id });
  }

  const found = Object.values(memoryStore.users).find((u) => u._id === id);
  return found || null;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = getDatabase();
  const safeUpdates = { ...updates, updatedAt: new Date() };

  if (db) {
    const col = db.collection<User>('users');
    const result = await col.findOneAndUpdate(
      { _id: id },
      { $set: safeUpdates },
      { returnDocument: 'after' }
    );
    return result as User | null;
  }

  const user = await findUserById(id);
  if (!user) return null;
  const updatedUser: User = { ...user, ...safeUpdates };
  memoryStore.users[updatedUser.email.toLowerCase()] = updatedUser;
  saveFallbackData();
  return updatedUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = getDatabase();

  if (db) {
    const usersCol = db.collection<User>('users');
    const sessionsCol = db.collection<Session>('sessions');
    await usersCol.deleteOne({ _id: id });
    await sessionsCol.deleteMany({ userId: id });
    return true;
  }

  const user = await findUserById(id);
  if (user) {
    delete memoryStore.users[user.email.toLowerCase()];
    // Remove all sessions for this user
    for (const [key, session] of Object.entries(memoryStore.sessions)) {
      if (session.userId === id) delete memoryStore.sessions[key];
    }
    saveFallbackData();
    return true;
  }
  return false;
}

export async function createSession(session: Session): Promise<Session> {
  const db = getDatabase();
  const tokenKey = hashToken(session.token);
  const sessionDoc: Session = { ...session, _id: tokenKey };

  if (db) {
    const col = db.collection<Session>('sessions');
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
    await col.insertOne(sessionDoc);
    return sessionDoc;
  }

  memoryStore.sessions[tokenKey] = sessionDoc;
  saveFallbackData();
  return sessionDoc;
}

export async function findSessionByToken(token: string): Promise<Session | null> {
  const db = getDatabase();
  const tokenKey = hashToken(token);

  if (db) {
    const col = db.collection<Session>('sessions');
    const session = await col.findOne({ _id: tokenKey });
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await col.deleteOne({ _id: tokenKey });
      return null;
    }
    return session;
  }

  const session = memoryStore.sessions[tokenKey];
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    delete memoryStore.sessions[tokenKey];
    saveFallbackData();
    return null;
  }
  return session;
}

export async function deleteSession(token: string): Promise<boolean> {
  const db = getDatabase();
  const tokenKey = hashToken(token);

  if (db) {
    const col = db.collection<Session>('sessions');
    const res = await col.deleteOne({ _id: tokenKey });
    return res.deletedCount > 0;
  }

  if (memoryStore.sessions[tokenKey]) {
    delete memoryStore.sessions[tokenKey];
    saveFallbackData();
    return true;
  }
  return false;
}

export async function deleteUserSessions(userId: string): Promise<void> {
  const db = getDatabase();

  if (db) {
    const col = db.collection<Session>('sessions');
    await col.deleteMany({ userId });
    return;
  }

  for (const [key, session] of Object.entries(memoryStore.sessions)) {
    if (session.userId === userId) delete memoryStore.sessions[key];
  }
  saveFallbackData();
}

export async function createPasswordReset(reset: PasswordResetToken): Promise<PasswordResetToken> {
  const db = getDatabase();
  const tokenKey = hashToken(reset.token);
  const doc: PasswordResetToken = { ...reset, _id: tokenKey };

  if (db) {
    const col = db.collection<PasswordResetToken>('password_resets');
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
    await col.insertOne(doc);
    return doc;
  }

  memoryStore.passwordResets[tokenKey] = doc;
  saveFallbackData();
  return doc;
}

export async function findPasswordReset(token: string): Promise<PasswordResetToken | null> {
  const db = getDatabase();
  const tokenKey = hashToken(token);

  if (db) {
    const col = db.collection<PasswordResetToken>('password_resets');
    const doc = await col.findOne({ _id: tokenKey });
    if (!doc) return null;
    if (doc.used || new Date(doc.expiresAt).getTime() < Date.now()) {
      return null;
    }
    return doc;
  }

  const doc = memoryStore.passwordResets[tokenKey];
  if (!doc) return null;
  if (doc.used || new Date(doc.expiresAt).getTime() < Date.now()) {
    return null;
  }
  return doc;
}

export async function markPasswordResetUsed(token: string): Promise<void> {
  const db = getDatabase();
  const tokenKey = hashToken(token);

  if (db) {
    const col = db.collection<PasswordResetToken>('password_resets');
    await col.updateOne({ _id: tokenKey }, { $set: { used: true } });
    return;
  }

  if (memoryStore.passwordResets[tokenKey]) {
    memoryStore.passwordResets[tokenKey].used = true;
    saveFallbackData();
  }
}

export async function resetStoreForTests(): Promise<void> {
  memoryStore = { users: {}, sessions: {}, passwordResets: {} };
  try {
    if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE);
  } catch {
    // Ignore
  }
}
