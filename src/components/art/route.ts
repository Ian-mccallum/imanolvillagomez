import { useCallback, useEffect, useState } from 'react';

export type StudioView = 'upload' | 'drops' | 'library' | 'insights' | 'help';

export interface StudioRoute {
  view: StudioView;
  /** open drop, for #drop/<id> */
  drop?: string;
  /** extra state for a view, e.g. insights range or a library item */
  arg?: string;
}

const VIEWS: StudioView[] = ['upload', 'drops', 'library', 'insights', 'help'];

/** #drops, #drop/<id>, #library/<path>, #insights/<range>, #help; anything else is the upload canvas. */
export function parseRoute(hash: string): StudioRoute {
  const [head, ...rest] = hash.replace(/^#\/?/, '').split('/');
  const tail = decodeURIComponent(rest.join('/'));
  if (head === 'drop' && tail) return { view: 'drops', drop: tail };
  if (VIEWS.includes(head as StudioView))
    return { view: head as StudioView, ...(tail ? { arg: tail } : {}) };
  return { view: 'upload' };
}

export function formatRoute(r: StudioRoute): string {
  if (r.drop) return `#drop/${encodeURIComponent(r.drop)}`;
  if (r.view === 'upload') return '';
  return `#${r.view}${r.arg ? `/${r.arg.split('/').map(encodeURIComponent).join('/')}` : ''}`;
}

/** Studio's position lives in the URL hash so Back, refresh and shared links work. */
export function useHashRoute(): [StudioRoute, (next: StudioRoute, replace?: boolean) => void] {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const sync = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  const go = useCallback((next: StudioRoute, replace = false) => {
    const url = `${window.location.pathname}${window.location.search}${formatRoute(next)}`;
    if (replace) window.history.replaceState(null, '', url);
    else window.history.pushState(null, '', url);
    setRoute(next);
  }, []);
  return [route, go];
}
