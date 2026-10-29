import crypto from 'node:crypto';
import type { User, UserPublicProfile } from '../models/User.model.js';

const SCRYPT_KEYLEN = 64;

/**
 * Hashes a password using Node's native scrypt algorithm with a 16-byte random salt.
 * Returns format: "scrypt:<salt_hex>:<hash_hex>"
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifies a password against the stored scrypt hash using constant-time comparison.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const parts = storedHash.split(':');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return resolve(false);
    }
    const [, salt, originalHashHex] = parts;
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const keyBuffer = Buffer.from(originalHashHex, 'hex');
        if (keyBuffer.length !== derivedKey.length) return resolve(false);
        resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Generates a cryptographically strong 256-bit random hex token.
 */
export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Computes SHA-256 hex digest of a token for secure database storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Strips password hash and private credentials from user before sending over API.
 */
export function sanitizeUser(user: User): UserPublicProfile {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    syncEnabled: Boolean(user.syncEnabled),
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt)
  };
}
