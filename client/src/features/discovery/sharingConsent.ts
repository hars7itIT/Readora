import { getSharingSettings, setSharingEnabled } from './sharingSync';

export function getSharingConsent(): boolean {
  return getSharingSettings().sharingEnabled;
}

export function setSharingConsent(enabled: boolean): void {
  setSharingEnabled(enabled);
}
