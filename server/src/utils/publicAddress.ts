import dns from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

export async function resolvePublicAddress(hostname: string): Promise<{ address: string; family: 4 | 6 }> {
  const lower = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (lower === 'localhost' || lower.endsWith('.localhost') || lower.endsWith('.local') || lower.endsWith('.internal')) {
    throw new Error('Local hostnames are not allowed.');
  }
  if (ipaddr.isValid(lower)) {
    const parsed = ipaddr.parse(lower);
    if (!isPublic(parsed)) throw new Error('Private or reserved IP addresses are not allowed.');
    return { address: parsed.toString(), family: parsed.kind() === 'ipv4' ? 4 : 6 };
  }
  const records = await dns.lookup(lower, { all: true, verbatim: true });
  if (!records.length) throw new Error('Hostname did not resolve.');
  // Reject mixed public/private DNS answers, not just the first result.
  for (const record of records) {
    const parsed = ipaddr.parse(record.address);
    if (!isPublic(parsed)) throw new Error('Hostname resolves to a private or reserved IP address.');
  }
  const chosen = records[0];
  return { address: chosen.address, family: chosen.family as 4 | 6 };
}
function isPublic(ip: ipaddr.IPv4 | ipaddr.IPv6): boolean {
  // ipaddr.js labels only globally routable addresses as unicast; this rejects loopback,
  // private, link-local, multicast, CGNAT, documentation and reserved ranges.
  return ip.range() === 'unicast';
}
