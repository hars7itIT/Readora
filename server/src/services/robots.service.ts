import { URL } from 'node:url';

interface RobotRule {
  agent: string;
  disallows: string[];
  allows: string[];
}

interface CacheEntry {
  rules: RobotRule[];
  timestamp: number;
}

const robotsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Parses robots.txt content into rules per user-agent
 */
export function parseRobotsTxt(content: string): RobotRule[] {
  const lines = content.split(/\r?\n/);
  const rules: RobotRule[] = [];
  let currentAgents: string[] = [];
  let currentDisallows: string[] = [];
  let currentAllows: string[] = [];

  const flush = () => {
    if (currentAgents.length > 0) {
      for (const agent of currentAgents) {
        rules.push({
          agent: agent.toLowerCase(),
          disallows: [...currentDisallows],
          allows: [...currentAllows]
        });
      }
      currentAgents = [];
      currentDisallows = [];
      currentAllows = [];
    }
  };

  for (let line of lines) {
    // Strip comments
    const commentIndex = line.indexOf('#');
    if (commentIndex !== -1) {
      line = line.substring(0, commentIndex);
    }
    line = line.trim();
    if (!line) continue;

    const parts = line.split(':');
    if (parts.length < 2) continue;

    const directive = parts[0].trim().toLowerCase();
    const value = parts.slice(1).join(':').trim();

    if (directive === 'user-agent') {
      if (currentDisallows.length > 0 || currentAllows.length > 0) {
        flush();
      }
      currentAgents.push(value);
    } else if (directive === 'disallow') {
      if (value) {
        currentDisallows.push(value);
      }
    } else if (directive === 'allow') {
      if (value) {
        currentAllows.push(value);
      }
    }
  }
  flush();

  return rules;
}

/**
 * Checks if a path is allowed under the parsed rules for SmallWebReader or *
 */
export function isPathAllowedByRobots(rules: RobotRule[], pathname: string, userAgent = 'SmallWebReader'): boolean {
  if (!rules || rules.length === 0) return true;

  const targetPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const normalizedAgent = userAgent.toLowerCase();

  // Find most specific matching agent (exact match first, then *)
  let matchingRule = rules.find((r) => r.agent === normalizedAgent);
  if (!matchingRule) {
    matchingRule = rules.find((r) => r.agent === '*');
  }

  if (!matchingRule) return true;

  // Check if any allow rule overrides
  for (const allow of matchingRule.allows) {
    if (targetPath.startsWith(allow)) {
      return true;
    }
  }

  // Check if any disallow rule matches
  for (const disallow of matchingRule.disallows) {
    if (disallow === '/') return false;
    if (targetPath.startsWith(disallow)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates whether the given URL is allowed by the host's robots.txt
 */
export async function checkRobotsPermission(
  targetUrl: string,
  fetchRobotsFn?: (robotsUrl: string) => Promise<string | null>
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const parsed = new URL(targetUrl);
    const origin = `${parsed.protocol}//${parsed.host}`;
    const pathname = parsed.pathname || '/';

    const now = Date.now();
    const cached = robotsCache.get(origin);
    let rules: RobotRule[];

    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      rules = cached.rules;
    } else {
      let robotsTxtContent: string | null = null;
      if (fetchRobotsFn) {
        try {
          robotsTxtContent = await fetchRobotsFn(`${origin}/robots.txt`);
        } catch {
          robotsTxtContent = null;
        }
      }

      if (robotsTxtContent) {
        rules = parseRobotsTxt(robotsTxtContent);
      } else {
        rules = [];
      }
      robotsCache.set(origin, { rules, timestamp: now });
    }

    const allowed = isPathAllowedByRobots(rules, pathname);
    return allowed
      ? { allowed: true }
      : { allowed: false, reason: `Path "${pathname}" is disallowed by site robots.txt policy.` };
  } catch {
    return { allowed: true };
  }
}
