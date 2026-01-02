import { useState, useEffect } from 'react';

/**
 * Hook to detect device type and screen size
 * Used for responsive optimizations (grain overlays, glitch intensity, etc.)
 */
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial size
    const checkSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    checkSize();
    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('resize', checkSize);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', checkSize);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    prefersReducedMotion,
  };
}

/**
 * Get responsive glitch intensity based on device
 */
export function useGlitchIntensity(): 'subtle' | 'medium' | 'strong' {
  const { isMobile, isTablet, prefersReducedMotion } = useResponsive();

  if (prefersReducedMotion) {
    return 'subtle';
  }

  if (isMobile) {
    return 'subtle';
  }

  if (isTablet) {
    return 'medium';
  }

  return 'strong';
}

