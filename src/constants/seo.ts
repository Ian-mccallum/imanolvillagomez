import { ROUTES } from './routes';

const BASE_URL = 'https://nolvideography.com';
const DEFAULT_KEYWORDS = 'music videographer, concert videography, music video production, tour videography, music photographer, IMANOL VILLAGOMEZ';

export interface PageSEOConfig {
  title: string;
  description: string;
  path: string;
  keywords?: string;
}

export const SEO_CONFIG: Record<string, PageSEOConfig> = {
  home: {
    title: 'IMANOL VILLAGOMEZ | Official Website',
    description: 'IMANOL VILLAGOMEZ - Professional music videographer specializing in concert footage, music videos, and tour documentation. View portfolio of work with artists like Playboi Carti, Osamason, and more.',
    path: ROUTES.HOME,
    keywords: DEFAULT_KEYWORDS,
  },
  work: {
    title: 'IMANOL VILLAGOMEZ | Work',
    description: 'Professional videography and photography portfolio by IMANOL VILLAGOMEZ. Music industry visual content creator.',
    path: ROUTES.WORK,
    keywords: DEFAULT_KEYWORDS,
  },
  videos: {
    title: 'IMANOL VILLAGOMEZ | Videos',
    description: 'Music video portfolio by IMANOL VILLAGOMEZ. Professional concert videography, tour footage, and music video production. Browse work with top artists.',
    path: ROUTES.WORK_VIDEOS,
    keywords: `${DEFAULT_KEYWORDS}, music videos, concert videos, tour videos`,
  },
  photos: {
    title: 'IMANOL VILLAGOMEZ | Photos',
    description: 'Concert photography and behind-the-scenes photos by IMANOL VILLAGOMEZ. Professional music industry photography portfolio.',
    path: ROUTES.WORK_PHOTOS,
    keywords: `${DEFAULT_KEYWORDS}, concert photography, music photography`,
  },
  other: {
    title: 'IMANOL VILLAGOMEZ | Other',
    description: 'Additional videography work and creative projects by IMANOL VILLAGOMEZ. Explore more visual content and behind-the-scenes footage.',
    path: ROUTES.OTHER,
    keywords: DEFAULT_KEYWORDS,
  },
  contact: {
    title: 'IMANOL VILLAGOMEZ | Contact',
    description: 'Contact IMANOL VILLAGOMEZ for professional music videography services. Available for tours, concerts, and music video production.',
    path: ROUTES.CONTACT,
    keywords: `${DEFAULT_KEYWORDS}, hire videographer, videography services`,
  },
  thankYou: {
    title: 'IMANOL VILLAGOMEZ | Thank You',
    description: 'Thank you for contacting IMANOL VILLAGOMEZ. Your message has been received and will be responded to shortly.',
    path: ROUTES.THANK_YOU,
    keywords: DEFAULT_KEYWORDS,
  },
  privacy: {
    title: 'IMANOL VILLAGOMEZ | Privacy Policy',
    description: 'Privacy Policy for IMANOL VILLAGOMEZ videography website. Learn how we collect, use, and protect your personal information.',
    path: ROUTES.PRIVACY,
    keywords: DEFAULT_KEYWORDS,
  },
};

export { BASE_URL };

