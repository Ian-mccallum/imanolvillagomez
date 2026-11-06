// The privacy page promises exactly this: public site only, private tools never,
// DNT/GPC honored, and no extra URL details beyond campaign tags.
export const SITE_HOSTS = ['www.imanolvillagomez.com', 'imanolvillagomez.com'];
const PRIVATE_PATH = /^\/(?:studio|art)(?:\/|$)/;

export interface PrivacySignals {
  globalPrivacyControl?: boolean;
  doNotTrack?: string | null;
}

export const optedOut = (n: PrivacySignals) => n.globalPrivacyControl === true || n.doNotTrack === '1';

/** The URL to report, or null when this view must not be counted. */
export function reportableUrl(raw: string, signals: PrivacySignals): string | null {
  if (optedOut(signals)) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (!SITE_HOSTS.includes(url.hostname) || PRIVATE_PATH.test(url.pathname)) return null;
  const campaign = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (key.toLowerCase().startsWith('utm_')) campaign.append(key, value);
  });
  url.search = campaign.toString();
  url.hash = '';
  return url.toString();
}
