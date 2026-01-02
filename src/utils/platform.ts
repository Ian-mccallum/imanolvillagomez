/**
 * Platform detection utilities
 * Detects iOS, Android, and web platforms with feature flags
 */

export interface PlatformInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  supportsFullscreenAPI: boolean;
  supportsPointerEvents: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Detect the current platform and capabilities
 */
export function detectPlatform(): PlatformInfo {
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  const platform = typeof window !== 'undefined' ? window.navigator.platform : '';
  
  // iOS detection
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Android detection
  const isAndroid = /Android/.test(userAgent);
  
  // Web (desktop) - not iOS or Android
  const isWeb = !isIOS && !isAndroid;
  
  // Feature detection
  const supportsFullscreenAPI = typeof document !== 'undefined' && (
    !!document.documentElement.requestFullscreen ||
    !!(document.documentElement as any).webkitRequestFullscreen ||
    !!(document.documentElement as any).mozRequestFullscreen ||
    !!(document.documentElement as any).msRequestFullscreen
  );
  
  const supportsPointerEvents = typeof window !== 'undefined' && 'PointerEvent' in window;
  
  // Safe area insets (iOS)
  const safeAreaInsets = {
    top: typeof window !== 'undefined' && window.visualViewport
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0', 10)
      : 0,
    bottom: typeof window !== 'undefined' && window.visualViewport
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0', 10)
      : 0,
    left: typeof window !== 'undefined' && window.visualViewport
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)') || '0', 10)
      : 0,
    right: typeof window !== 'undefined' && window.visualViewport
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0', 10)
      : 0,
  };
  
  return {
    isIOS,
    isAndroid,
    isWeb,
    supportsFullscreenAPI,
    supportsPointerEvents,
    safeAreaInsets,
  };
}

/**
 * Get safe area CSS values for iOS
 */
export function getSafeAreaCSS(): string {
  return `
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  `;
}

