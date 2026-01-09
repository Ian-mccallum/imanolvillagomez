import { Video } from '@/types';

/**
 * Video portfolio data for Imanol Villagomez
 * Videos are hosted on Cloudflare R2
 * Images are located in /public/images/
 * 
 * To mark a video as an "Edit" (separate from artist work), add: isEdit: true
 * Videos without isEdit will be organized by their client/artist name
 */

// Get R2 base URL from environment variable, fallback to local paths for development
const R2_BASE_URL = import.meta.env.VITE_R2_PUBLIC_URL || '';

/**
 * Helper function to get full video URL
 * Uses R2 CDN URL if available, otherwise falls back to local path
 * All videos including background video use R2 CDN for optimal performance
 */
const getVideoUrl = (filename: string): string => {
  // Use R2 CDN for all videos (including background video)
  // R2 CDN is much faster than Vercel static hosting due to edge caching
  if (R2_BASE_URL) {
    return `${R2_BASE_URL}/videos/${filename}`;
  }
  return `/videos/${filename}`;
};
export const videos: Video[] = [
  {
    id: 'osamason3',
    title: 'Osamason 3',
    client: 'Osamason',
    artist: 'Osamason',
    song: 'Habits',
    tour: 'Psykotic',
    date: 'October 25, 2025',
    year: 2025,
    location: 'CHICAGO',
    category: 'music-video',
    videoUrl: getVideoUrl('osamason3.mp4'),
    thumbnail: getVideoUrl('osamason3.mp4'), // Use video as thumbnail
    featured: true,
  },
  {
    id: 'carti-like-weezy',
    title: 'Carti Like Weezy',
    client: 'Playboi Carti',
    artist: 'Playboi Carti',
    song: 'Like Weezy',
    tour: 'Antagonist Tour',
    date: 'October 30, 2025',
    year: 2025,
    location: 'CHICAGO',
    category: 'music-video',
    videoUrl: getVideoUrl('cartiLIKEWEEZY.mp4'),
    thumbnail: getVideoUrl('cartiLIKEWEEZY.mp4'),
    featured: true,
    rotation: 270, // Rotate 270 degrees (upright orientation)
  },
  {
    id: 'osamason-psykotic2',
    title: 'Osamason Psykotic 2',
    client: 'Osamason',
    artist: 'Osamason',
    song: "It's a Party",
    tour: 'Psykotic Tour',
    date: 'October 25, 2025',
    year: 2025,
    location: 'CHICAGO',
    category: 'music-video',
    videoUrl: getVideoUrl('OsamasonPsykotic2.mp4'),
    thumbnail: getVideoUrl('OsamasonPsykotic2.mp4'),
  },
  {
    id: 'osamason-psykotic',
    title: 'Osamason Psykotic',
    client: 'Osamason',
    artist: 'Osamason',
    song: "What's Happening",
    tour: 'Psykotic Tour',
    date: 'October 25, 2025',
    year: 2025,
    location: 'CHICAGO',
    category: 'music-video',
    videoUrl: getVideoUrl('osamasonPSYKOTIC.mp4'),
    thumbnail: getVideoUrl('osamasonPSYKOTIC.mp4'),
    featured: true,
  },
  {
    id: 'hellp1',
    title: 'Hellp 1',
    client: 'Hellp',
    artist: 'The Hellp',
    song: 'Ether',
    tour: 'Vic Theatre',
    date: 'September 16, 2025',
    year: 2025,
    location: 'CHICAGO',
    category: 'music-video',
    videoUrl: getVideoUrl('hellp1.mp4'),
    thumbnail: getVideoUrl('hellp1.mp4'),
  },
  {
    id: '2hollis-lolla',
    title: '2hollis Lolla',
    client: '2hollis',
    artist: '2hollis',
    song: 'Trauma',
    tour: 'Lollapalooza',
    date: 'July 31st, 2025',
    year: 2025,
    location: 'CHICAGO',
    category: 'music-video',
    videoUrl: getVideoUrl('2hollisLOLLA.mp4'),
    thumbnail: getVideoUrl('2hollisLOLLA.mp4'),
    featured: true,
    rotation: 270, // Rotate 270 degrees (upright orientation)
  },
  {
    id: 'carti1',
    title: 'Carti 1',
    client: 'Playboi Carti',
    artist: 'Playboi Carti',
    song: 'RATHER LIE',
    tour: 'After Hours Til Dawn Tour',
    date: 'May 30th, 2025',
    year: 2025,
    location: 'CHICAGO',
    category: 'music-video',
    videoUrl: getVideoUrl('carti1.mp4'),
    thumbnail: getVideoUrl('carti1.mp4'),
  },
  {
    id: 'charlixcx-sweat',
    title: 'Charli XCX Sweat',
    client: 'Charli XCX',
    artist: 'Charli XCX',
    song: '365',
    tour: 'Sweat Tour',
    date: 'September 30, 2024',
    year: 2024,
    location: 'CHICAGO',
    category: 'music-video',
    videoUrl: getVideoUrl('charlixcxSWEAT.mp4'),
    thumbnail: getVideoUrl('charlixcxSWEAT.mp4'),
    featured: true,
  },
  {
    id: 'charlixcx-guess',
    title: 'Charli XCX Guess',
    client: 'Charli XCX',
    artist: 'Charli XCX',
    song: 'Guess',
    tour: 'Sweat Tour',
    date: 'September 30, 2024',
    year: 2024,
    location: 'CHICAGO',
    category: 'music-video',
    videoUrl: getVideoUrl('charlixcxGUESS.mp4'),
    thumbnail: getVideoUrl('charlixcxGUESS.mp4'),
    featured: true,
  },
];

/**
 * Lost Files - Videos without new format (artist/song/tour/date)
 * These are moved to the LOST FILES page
 */
export const lostFilesVideos: Video[] = [
  {
    id: 'che',
    title: 'Che',
    client: 'Che',
    year: 2024,
    category: 'music-video',
    videoUrl: getVideoUrl('che.mp4'),
    thumbnail: getVideoUrl('che.mp4'),
  },
  {
    id: 'hellp-full',
    title: 'Hellp Full',
    client: 'Hellp',
    year: 2024,
    category: 'music-video',
    videoUrl: getVideoUrl('hellpFULL.mp4'),
    thumbnail: getVideoUrl('hellpFULL.mp4'),
  },
  {
    id: 'hellp2',
    title: 'Hellp 2',
    client: 'Hellp',
    year: 2024,
    category: 'music-video',
    videoUrl: getVideoUrl('hellp2.mp4'),
    thumbnail: getVideoUrl('hellp2.mp4'),
  },
  {
    id: 'osamason-preview',
    title: 'Osamason Preview',
    client: 'Osamason',
    year: 2024,
    category: 'music-video',
    videoUrl: getVideoUrl('osamasonpreview.mp4'),
    thumbnail: getVideoUrl('osamasonpreview.mp4'),
  },
  {
    id: 'osamason-outro',
    title: 'Osamason Outro',
    client: 'Osamason',
    year: 2024,
    category: 'music-video',
    videoUrl: getVideoUrl('osamasonoutro.mp4'),
    thumbnail: getVideoUrl('osamasonoutro.mp4'),
  },
  {
    id: '2hollis-full',
    title: '2hollis Full',
    client: '2hollis',
    year: 2024,
    category: 'music-video',
    videoUrl: getVideoUrl('2hollisfull.mp4'),
    thumbnail: getVideoUrl('2hollisfull.mp4'),
  },
  {
    id: 'osamason-full',
    title: 'Osamason Full',
    client: 'Osamason',
    year: 2024,
    category: 'music-video',
    videoUrl: getVideoUrl('osamasonfull.mp4'),
    thumbnail: getVideoUrl('osamasonfull.mp4'),
  },
];

/**
 * Get featured videos
 */
export const getFeaturedVideos = (): Video[] => {
  return videos.filter(video => video.featured);
};

/**
 * Get videos by client/artist
 */
export const getVideosByClient = (client: string): Video[] => {
  return videos.filter(video => video.client?.toLowerCase() === client.toLowerCase());
};

