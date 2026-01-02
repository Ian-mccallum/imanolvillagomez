/**
 * Native Fullscreen API utilities
 * Handles browser/device native fullscreen with fallbacks
 */

export interface FullscreenAPI {
  requestFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  webkitEnterFullscreen?: () => void; // iOS Safari video specific
  mozRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  exitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  mozExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

export interface FullscreenDocument {
  fullscreenElement?: Element | null;
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  fullscreenEnabled?: boolean;
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  onfullscreenchange?: ((this: Document, ev: Event) => any) | null;
  onwebkitfullscreenchange?: ((this: Document, ev: Event) => any) | null;
  onmozfullscreenchange?: ((this: Document, ev: Event) => any) | null;
  onmsfullscreenchange?: ((this: Document, ev: Event) => any) | null;
}

/**
 * Get the fullscreen API for an element
 */
export function getFullscreenAPI(element: HTMLElement): FullscreenAPI | null {
  if (!element) return null;
  
  return {
    requestFullscreen: element.requestFullscreen?.bind(element),
    webkitRequestFullscreen: (element as any).webkitRequestFullscreen?.bind(element),
    webkitEnterFullscreen: (element as any).webkitEnterFullscreen?.bind(element), // iOS Safari video
    mozRequestFullscreen: (element as any).mozRequestFullscreen?.bind(element),
    msRequestFullscreen: (element as any).msRequestFullscreen?.bind(element),
  };
}

/**
 * Get the document fullscreen API
 */
export function getDocumentFullscreenAPI(): FullscreenDocument | null {
  if (typeof document === 'undefined') return null;
  
  return document as any;
}

/**
 * Request fullscreen for an element
 */
export async function requestFullscreen(element: HTMLElement): Promise<void> {
  const api = getFullscreenAPI(element);
  if (!api) {
    throw new Error('Fullscreen API not supported');
  }
  
  // Try standard API first
  if (api.requestFullscreen) {
    return api.requestFullscreen();
  }
  
  // Try webkit (Safari)
  if (api.webkitRequestFullscreen) {
    return api.webkitRequestFullscreen();
  }
  
  // Try moz (Firefox)
  if (api.mozRequestFullscreen) {
    return api.mozRequestFullscreen();
  }
  
  // Try ms (IE/Edge)
  if (api.msRequestFullscreen) {
    return api.msRequestFullscreen();
  }
  
  throw new Error('Fullscreen API not available');
}

/**
 * Exit fullscreen
 */
export async function exitFullscreen(): Promise<void> {
  const doc = getDocumentFullscreenAPI();
  if (!doc) {
    throw new Error('Document not available');
  }
  
  if ((doc as any).exitFullscreen) {
    return (doc as any).exitFullscreen();
  }
  
  if ((doc as any).webkitExitFullscreen) {
    return (doc as any).webkitExitFullscreen();
  }
  
  if ((doc as any).mozExitFullscreen) {
    return (doc as any).mozExitFullscreen();
  }
  
  if ((doc as any).msExitFullscreen) {
    return (doc as any).msExitFullscreen();
  }
  
  throw new Error('Exit fullscreen not available');
}

/**
 * Check if element is in fullscreen
 */
export function isFullscreen(element?: Element | null): boolean {
  const doc = getDocumentFullscreenAPI();
  if (!doc) return false;
  
  const fullscreenElement = 
    doc.fullscreenElement ||
    (doc as any).webkitFullscreenElement ||
    (doc as any).mozFullScreenElement ||
    (doc as any).msFullscreenElement;
  
  if (!element) {
    return !!fullscreenElement;
  }
  
  return fullscreenElement === element;
}

/**
 * Check if fullscreen is enabled
 */
export function isFullscreenEnabled(): boolean {
  const doc = getDocumentFullscreenAPI();
  if (!doc) return false;
  
  return !!(
    doc.fullscreenEnabled ||
    (doc as any).webkitFullscreenEnabled ||
    (doc as any).mozFullScreenEnabled ||
    (doc as any).msFullscreenEnabled
  );
}

/**
 * Add fullscreen change listener
 */
export function addFullscreenChangeListener(
  callback: () => void
): () => void {
  if (typeof document === 'undefined') return () => {};
  
  const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'msfullscreenchange',
  ];
  
  events.forEach(event => {
    document.addEventListener(event, callback);
  });
  
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, callback);
    });
  };
}

