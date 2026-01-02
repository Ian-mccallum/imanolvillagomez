import { Video } from '@/types';

/**
 * Video portfolio data for Imanol Villagomez
 * Videos are located in /public/videos/
 * Images are located in /public/images/
 * 
 * To mark a video as an "Edit" (separate from artist work), add: isEdit: true
 * Videos without isEdit will be organized by their client/artist name
 */
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
    videoUrl: '/videos/osamason3.mp4',
    thumbnail: '/videos/osamason3.mp4', // Use video as thumbnail
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
    videoUrl: '/videos/cartiLIKEWEEZY.mp4',
    thumbnail: '/videos/cartiLIKEWEEZY.mp4',
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
    videoUrl: '/videos/OsamasonPsykotic2.mp4',
    thumbnail: '/videos/OsamasonPsykotic2.mp4',
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
    videoUrl: '/videos/osamasonPSYKOTIC.mp4',
    thumbnail: '/videos/osamasonPSYKOTIC.mp4',
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
    videoUrl: '/videos/hellp1.mp4',
    thumbnail: '/videos/hellp1.mp4',
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
    videoUrl: '/videos/2hollisLOLLA.mp4',
    thumbnail: '/videos/2hollisLOLLA.mp4',
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
    videoUrl: '/videos/carti1.mp4',
    thumbnail: '/videos/carti1.mp4',
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
    videoUrl: '/videos/charlixcxSWEAT.mp4',
    thumbnail: '/videos/charlixcxSWEAT.mp4',
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
    videoUrl: '/videos/charlixcxGUESS.mp4',
    thumbnail: '/videos/charlixcxGUESS.mp4',
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
    videoUrl: '/videos/che.mp4',
    thumbnail: '/videos/che.mp4',
  },
  {
    id: 'hellp-full',
    title: 'Hellp Full',
    client: 'Hellp',
    year: 2024,
    category: 'music-video',
    videoUrl: '/videos/hellpFULL.mp4',
    thumbnail: '/videos/hellpFULL.mp4',
  },
  {
    id: 'hellp2',
    title: 'Hellp 2',
    client: 'Hellp',
    year: 2024,
    category: 'music-video',
    videoUrl: '/videos/hellp2.mp4',
    thumbnail: '/videos/hellp2.mp4',
  },
  {
    id: 'osamason-preview',
    title: 'Osamason Preview',
    client: 'Osamason',
    year: 2024,
    category: 'music-video',
    videoUrl: '/videos/osamasonpreview.mp4',
    thumbnail: '/videos/osamasonpreview.mp4',
  },
  {
    id: 'osamason-outro',
    title: 'Osamason Outro',
    client: 'Osamason',
    year: 2024,
    category: 'music-video',
    videoUrl: '/videos/osamasonoutro.mp4',
    thumbnail: '/videos/osamasonoutro.mp4',
  },
  {
    id: '2hollis-full',
    title: '2hollis Full',
    client: '2hollis',
    year: 2024,
    category: 'music-video',
    videoUrl: '/videos/2hollisfull.mp4',
    thumbnail: '/videos/2hollisfull.mp4',
  },
  {
    id: 'osamason-full',
    title: 'Osamason Full',
    client: 'Osamason',
    year: 2024,
    category: 'music-video',
    videoUrl: '/videos/osamasonfull.mp4',
    thumbnail: '/videos/osamasonfull.mp4',
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

