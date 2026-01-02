export const ROUTES = {
  HOME: '/',
  WORK: '/work',
  WORK_VIDEOS: '/work/videos',
  WORK_PHOTOS: '/work/photos',
  OTHER: '/other',
  ABOUT: '/about',
  CONTACT: '/contact',
  THANK_YOU: '/thank-you',
  PRIVACY: '/privacy',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
