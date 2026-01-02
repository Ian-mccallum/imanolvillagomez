import { useEffect } from 'react';

/**
 * Hook to dynamically set the page title
 * Format: "IMANOL VILLAGOMEZ | {pageName}"
 * 
 * @param pageName - The name of the current page (e.g., "Videos", "Photos", "Contact")
 */
export const usePageTitle = (pageName: string) => {
  useEffect(() => {
    const baseTitle = 'IMANOL VILLAGOMEZ';
    const fullTitle = pageName 
      ? `${baseTitle} | ${pageName}`
      : `${baseTitle} | Official Website`;
    
    document.title = fullTitle;
    
    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = `${baseTitle} | Official Website`;
    };
  }, [pageName]);
};

