import { useEffect } from 'react';

interface StructuredDataProps {
  data: object | object[];
}

/**
 * Component to inject JSON-LD structured data into the page
 * This is completely invisible to users but helps search engines and AI platforms
 * 
 * @param data - Single schema object or array of schema objects
 */
export const StructuredData = ({ data }: StructuredDataProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.id = 'structured-data';
    
    // Remove existing structured data script if it exists
    const existing = document.getElementById('structured-data');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null; // This component renders nothing visible
};

/**
 * Helper function to create Person schema
 */
export const createPersonSchema = (config: {
  name: string;
  jobTitle: string;
  url: string;
  email?: string;
  address?: {
    locality: string;
    region: string;
  };
  sameAs?: string[];
}) => {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: config.name,
    jobTitle: config.jobTitle,
    url: config.url,
  };

  if (config.email) {
    schema.email = config.email;
  }

  if (config.address) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: config.address.locality,
      addressRegion: config.address.region,
    };
  }

  if (config.sameAs && config.sameAs.length > 0) {
    schema.sameAs = config.sameAs;
  }

  return schema;
};

/**
 * Helper function to create ProfessionalService schema
 */
export const createProfessionalServiceSchema = (config: {
  name: string;
  description: string;
  providerName: string;
  areaServed?: string;
  serviceType?: string[];
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: config.name,
    description: config.description,
    provider: {
      '@type': 'Person',
      name: config.providerName,
    },
    ...(config.areaServed && { areaServed: config.areaServed }),
    ...(config.serviceType && { serviceType: config.serviceType }),
  };
};

/**
 * Helper function to create WebSite schema with SearchAction
 */
export const createWebSiteSchema = (config: {
  name: string;
  url: string;
  searchUrl?: string;
}) => {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: config.url,
  };

  if (config.searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: config.searchUrl,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return schema;
};

/**
 * Helper function to create BreadcrumbList schema
 */
export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Helper function to create VideoObject schema
 */
export const createVideoObjectSchema = (config: {
  name: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  uploadDate?: string;
  creatorName: string;
}) => {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: config.name,
    description: config.description,
    thumbnailUrl: config.thumbnailUrl,
    contentUrl: config.contentUrl,
    creator: {
      '@type': 'Person',
      name: config.creatorName,
    },
  };

  if (config.uploadDate) {
    schema.uploadDate = config.uploadDate;
  }

  return schema;
};

/**
 * Helper function to create ImageObject schema
 */
export const createImageObjectSchema = (config: {
  name: string;
  description: string;
  contentUrl: string;
  creatorName: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: config.name,
    description: config.description,
    contentUrl: config.contentUrl,
    creator: {
      '@type': 'Person',
      name: config.creatorName,
    },
  };
};

/**
 * Helper function to create FAQPage schema
 */
export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

