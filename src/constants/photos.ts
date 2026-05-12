import { Photo } from '@/types';
import shootFeb2026 from '@/constants/data/photos-shoot-20260228.json';

/**
 * Photo portfolio data for Imanol Villagomez
 * Images are located in /public/images/
 *
 * To mark a photo as an "Edit" (separate from artist work), add: isEdit: true
 * Photos without isEdit will be organized by their client/artist name
 */

/** Tour labels for the Photos page tour filter (aligned with shoot / archive). */
const PHOTO_TOUR = {
  NETTSPEND: 'NETTSPEND - EARLYLIFE CRISIS USA TOUR',
  SAINT: '1300SAINT - THE SAVIOR TOUR',
  PUMA: 'PUMA BLUE - CROAK DREAM TOUR',
  HOLLIS: '2HOLLIS - THE STAR TOUR',
  FROST: 'FROST CHILDREN - SISTER TOUR',
  OSAMASON: 'OSAMASON - PYSKOTIC US TOUR',
  YUNG: 'YUNG LEAN - FOREVER YUNG TOUR',
} as const;

/** The Hellp is not on the main tour list; keeps a distinct filter bucket. */
const PHOTO_TOUR_HELLP = 'THE HELLP - US TOUR';

function tourForFeb2026Shoot(client: string | undefined): string {
  switch (client) {
    case 'Puma Blue':
      return PHOTO_TOUR.PUMA;
    case '1300saint':
      return PHOTO_TOUR.SAINT;
    case 'NETTSPEND':
    case 'Salami':
    case 'Kels':
      return PHOTO_TOUR.NETTSPEND;
    default:
      return PHOTO_TOUR.NETTSPEND;
  }
}

function tourForArchiveClient(client: string | undefined): string {
  switch (client) {
    case 'Frost Children':
      return PHOTO_TOUR.FROST;
    case '2hollis':
      return PHOTO_TOUR.HOLLIS;
    case 'Yung Lean':
      return PHOTO_TOUR.YUNG;
    case 'Osamason':
      return PHOTO_TOUR.OSAMASON;
    case 'The Hellp':
      return PHOTO_TOUR_HELLP;
    default:
      return PHOTO_TOUR.NETTSPEND;
  }
}

const photosArchive: Photo[] = [
  {
    id: 'photo-2',
    imageUrl: '/images/frostchildren-7.jpeg',
    year: 2025,
    client: 'Frost Children',
  },
  {
    id: 'photo-3',
    imageUrl: '/images/thehellp-3.jpeg',
    year: 2025,
    client: 'The Hellp',
  },
  {
    id: 'photo-4',
    imageUrl: '/images/2hollis-1.jpeg',
    year: 2025,
    client: '2hollis',
  },
  {
    id: 'photo-5',
    imageUrl: '/images/frostchildren-6.jpeg',
    year: 2025,
    client: 'Frost Children',
  },
  {
    id: 'photo-7',
    imageUrl: '/images/yunglean-4.jpeg',
    year: 2025,
    client: 'Yung Lean',
  },
  {
    id: 'photo-8',
    imageUrl: '/images/thehellp-4.jpeg',
    year: 2025,
    client: 'The Hellp',
  },
  {
    id: 'photo-9',
    imageUrl: '/images/2hollis-2.jpeg',
    year: 2025,
    client: '2hollis',
  },
  {
    id: 'photo-10',
    imageUrl: '/images/frostchildren-5.jpeg',
    year: 2025,
    client: 'Frost Children',
  },
  {
    id: 'photo-11',
    imageUrl: '/images/yunglean-3.jpeg',
    year: 2025,
    client: 'Yung Lean',
  },
  {
    id: 'photo-12',
    imageUrl: '/images/frostchildren-4.jpeg',
    year: 2025,
    client: '2hollis',
  },
  {
    id: 'photo-13',
    imageUrl: '/images/frostchildren-3.jpeg',
    year: 2025,
    client: 'Frost Children',
  },
  {
    id: 'photo-14',
    imageUrl: '/images/yunglean-2.jpeg',
    year: 2025,
    client: 'Yung Lean',
  },
  {
    id: 'photo-15',
    imageUrl: '/images/frostchildren-2.jpeg',
    year: 2025,
    client: 'Frost Children',
  },
  {
    id: 'photo-16',
    imageUrl: '/images/thehellp-2.jpeg',
    year: 2025,
    client: 'The Hellp',
  },
  {
    id: 'photo-17',
    imageUrl: '/images/osamason-3.jpeg',
    year: 2025,
    client: 'Osamason',
  },
  {
    id: 'photo-18',
    imageUrl: '/images/osamason-2.jpeg',
    year: 2025,
    client: 'Osamason',
  },
  {
    id: 'photo-19',
    imageUrl: '/images/osamason-1.jpeg',
    year: 2025,
    client: 'Osamason',
  },
  {
    id: 'photo-20',
    imageUrl: '/images/frostchildren-1.jpeg',
    year: 2025,
    client: 'Frost Children',
  },
  {
    id: 'photo-21',
    imageUrl: '/images/thehellp-1.jpeg',
    year: 2025,
    client: 'The Hellp',
  },
  {
    id: 'photo-22',
    imageUrl: '/images/yunglean-1.jpeg',
    year: 2025,
    client: 'Yung Lean',
  },
];

/** Feb 2026 shoot + archive; detail views sort by year. */
export const photos: Photo[] = [
  ...(shootFeb2026 as Photo[]).map((p) => ({
    ...p,
    tour: p.tour ?? tourForFeb2026Shoot(p.client),
  })),
  ...photosArchive.map((p) => ({
    ...p,
    tour: p.tour ?? tourForArchiveClient(p.client),
  })),
];
