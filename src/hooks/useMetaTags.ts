import { useEffect } from 'react';
// Imported rather than redeclared: this hook used to keep its own copy of the site
// URL, so changing the domain in one place silently left canonical tags on the old
// host. One definition, in constants/seo.ts.
import { BASE_URL } from '@/constants';

interface MetaTagsConfig {
  title?: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  keywords?: string;
  author?: string;
  /**
   * Keep the page out of search results. Needed for pages that exist but should
   * never rank — the 404 and the post-submit thank-you. Left off, every route
   * (including every mistyped URL that renders the 404) advertises itself as
   * indexable, which invites an unbounded set of junk URLs into the index.
   */
  noindex?: boolean;
}

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
      noindex = false,
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
      // Always written, never conditionally skipped: this is a single-page app, so
      // the tag persists across navigation. If a noindex page left it untouched on
      // the way out, the next page would inherit noindex and silently drop out of
      // search.
      { name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow' },
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

