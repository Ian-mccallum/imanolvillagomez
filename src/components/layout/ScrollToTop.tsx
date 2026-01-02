import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * 
 * Scrolls to top of page when route changes
 * This ensures users always start at the top when navigating to a new page
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Instant scroll for better UX
    });
  }, [pathname]);

  return null;
};

