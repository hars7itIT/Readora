export interface SharingSettings {
  sharingEnabled: boolean;
  lastSharedAt: number | null;
  lastSharedSet: string[] | null;
}

const SETTINGS_KEY = 'small_reader_sharing_settings';

export function getSharingSettings(): SharingSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        sharingEnabled: Boolean(parsed.sharingEnabled),
        lastSharedAt: parsed.lastSharedAt ? Number(parsed.lastSharedAt) : null,
        lastSharedSet: Array.isArray(parsed.lastSharedSet) ? parsed.lastSharedSet : null
      };
    }
  } catch {
    // fallback
  }
  return {
    sharingEnabled: false,
    lastSharedAt: null,
    lastSharedSet: null
  };
}

export function saveSharingSettings(settings: SharingSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // fallback
  }
}

/**
 * Turning sharing OFF: stop all future submissions immediately and clear lastSharedSet.
 */
export function setSharingEnabled(enabled: boolean): void {
  const current = getSharingSettings();
  if (!enabled) {
    saveSharingSettings({
      sharingEnabled: false,
      lastSharedAt: null,
      lastSharedSet: null
    });
  } else {
    saveSharingSettings({
      ...current,
      sharingEnabled: true
    });
  }
}

/**
 * Pure evaluation function for maybeShare decisions (for unit testing and application code)
 */
export function evaluateMaybeShare(
  settings: SharingSettings,
  currentSubscriptions: string[],
  now: number = Date.now(),
  minShare = 3
): { shouldShare: boolean; reason: string } {
  // 1. If sharingEnabled is false -> do nothing. Stop.
  if (!settings.sharingEnabled) {
    return { shouldShare: false, reason: 'sharing_disabled' };
  }

  // 2. If subscriptions has fewer than MIN_SHARE (e.g. 3) feeds -> do nothing.
  if (currentSubscriptions.length < minShare) {
    return { shouldShare: false, reason: 'insufficient_feeds' };
  }

  // 3. If lastSharedAt is null -> submit now (first share after opt-in).
  if (settings.lastSharedAt === null) {
    return { shouldShare: true, reason: 'initial_share' };
  }

  // 4. Else let age = now - lastSharedAt:
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const ageDays = (now - settings.lastSharedAt) / ONE_DAY_MS;

  // If age < 30 days -> do nothing (never submit on every follow).
  if (ageDays < 30) {
    return { shouldShare: false, reason: 'too_recent' };
  }

  // If age >= 60 days -> submit even if unchanged (to renew contribution before 90-day expiry)
  if (ageDays >= 60) {
    return { shouldShare: true, reason: 'renewal_60_days' };
  }

  // If age >= 30 days AND list changed meaningfully (at least 3 added/removed, or >= 20% difference)
  const lastSet = new Set(settings.lastSharedSet || []);
  const currentSet = new Set(currentSubscriptions);

  let added = 0;
  for (const f of currentSet) {
    if (!lastSet.has(f)) added++;
  }
  let removed = 0;
  for (const f of lastSet) {
    if (!currentSet.has(f)) removed++;
  }

  const diffCount = added + removed;
  const totalFeeds = Math.max(lastSet.size, currentSet.size, 1);
  const diffPercent = (diffCount / totalFeeds) * 100;

  if (diffCount >= 3 || diffPercent >= 20) {
    return { shouldShare: true, reason: 'meaningful_change' };
  }

  return { shouldShare: false, reason: 'insufficient_change' };
}

/**
 * Executes maybeShare() with network call and local state persistence
 */
export async function maybeShare(
  currentSubscriptions: string[],
  shareFn: (feeds: string[]) => Promise<any>,
  now: number = Date.now(),
  minShare = 3
): Promise<{ shared: boolean; reason: string }> {
  const settings = getSharingSettings();
  const evaluation = evaluateMaybeShare(settings, currentSubscriptions, now, minShare);

  if (!evaluation.shouldShare) {
    return { shared: false, reason: evaluation.reason };
  }

  try {
    // Deduplicate and normalize list
    const batch = Array.from(new Set(currentSubscriptions));
    await shareFn(batch);

    // On successful submit: set lastSharedAt = now and lastSharedSet = current set (locally only)
    saveSharingSettings({
      sharingEnabled: true,
      lastSharedAt: now,
      lastSharedSet: batch
    });

    return { shared: true, reason: evaluation.reason };
  } catch (err) {
    // On failure: do NOT update lastSharedAt; retry on a later run.
    return { shared: false, reason: 'network_or_rate_limit_failure' };
  }
}
