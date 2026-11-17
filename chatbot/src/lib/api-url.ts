type Env = { os: string; envUrl?: string; hostUri?: string };

// Dev: Expo Go talks to the Metro dev server over LAN (http). Production: set EXPO_PUBLIC_API_URL to an https host.
export function apiBaseUrl({ os, envUrl, hostUri }: Env): string {
  if (envUrl) return envUrl.replace(/\/+$/, '');
  if (os === 'web' || !hostUri) return '';
  return `http://${hostUri}`;
}
