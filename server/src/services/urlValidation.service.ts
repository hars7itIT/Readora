import { resolvePublicAddress } from '../utils/publicAddress.js';

export async function validatePublicHost(hostname: string): Promise<{ address: string; family: 4 | 6 }> {
  const lower = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (lower === 'localhost' || lower.endsWith('.localhost') || lower.endsWith('.local') || lower.endsWith('.internal')) {
    throw new Error('Local and private hostnames are not allowed.');
  }
  return resolvePublicAddress(lower);
}
