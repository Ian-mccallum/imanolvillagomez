import { inject } from '@vercel/analytics';
import { SITE_HOSTS, optedOut, reportableUrl, type PrivacySignals } from './analyticsFilter';

const signals = () => navigator as Navigator & PrivacySignals;

/** Vercel Web Analytics on the public site only; never loads on the studio host or previews. */
export function startAnalytics() {
  if (!SITE_HOSTS.includes(location.hostname) || optedOut(signals())) return;
  inject({
    mode: 'production',
    beforeSend: (event) => {
      const url = reportableUrl(event.url, signals());
      return url ? { ...event, url } : null;
    },
  });
}
