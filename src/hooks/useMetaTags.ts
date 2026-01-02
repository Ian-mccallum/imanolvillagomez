import { useEffect } from 'react';

interface MetaTagsConfig {
  title?: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  keywords?: string;
  author?: string;
}

const BASE_URL = 'https://nolvideography.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/I.V..png`;
const DEFAULT_AUTHOR = 'IMANOL VILLAGOMEZ';

/**
 * Hook to manage all meta tags for SEO
 * Handles: meta description, Open Graph tags, Twitter Cards, canonical URLs, and more
 * 
 * @param config - Meta tags configuration
 */
export const useMetaTags = (config: MetaTagsConfig) => {
  useEffect(() => {
    const {
      title,
      description,
      canonicalUrl,
      ogImage = DEFAULT_OG_IMAGE,
      ogType = 'website',
      twitterCard = 'summary_large_image',
      keywords,
      author = DEFAULT_AUTHOR,
    } = config;

    // Get current path for canonical URL if not provided
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const canonical = canonicalUrl || `${BASE_URL}${currentPath}`;
    const fullTitle = title || document.title;

    // Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // Open Graph Tags
    const ogTags = [
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:url', content: canonical },
      { property: 'og:type', content: ogType },
      { property: 'og:site_name', content: 'IMANOL VILLAGOMEZ' },
    ];

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Twitter Card Tags
    const twitterTags = [
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ];

    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Additional Meta Tags
    const additionalTags = [
      { name: 'author', content: author },
      { name: 'robots', content: 'index, follow' },
      { name: 'language', content: 'English' },
      { name: 'revisit-after', content: '7 days' },
    ];

    if (keywords) {
      additionalTags.push({ name: 'keywords', content: keywords });
    }

    additionalTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Cleanup function
    return () => {
      // Note: We don't remove meta tags on cleanup as they should persist
      // The next page will update them with new values
    };
  }, [config]);
};

