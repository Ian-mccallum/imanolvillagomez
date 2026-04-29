/**
 * Shared fields for card / fullscreen captions (Video or MediaItem).
 */
export type SongLocationCaptionFields = {
  song?: string;
  artist?: string;
  client?: string;
  location?: string;
  isEdit?: boolean;
  title?: string;
};

/**
 * Card / fullscreen caption: "SONG | LOCATION" (all caps).
 * If there is no song and the piece is marked as an edit, uses ARTIST (artist/client) instead of song.
 */
export function formatVideoSongLocationCaption(video: SongLocationCaptionFields): string | null {
  const loc = (video.location ?? '').trim().toUpperCase();
  const hasSong = !!(video.song && video.song.trim());
  let primary: string;
  if (video.isEdit && !hasSong) {
    primary = (video.artist ?? video.client ?? '').trim().toUpperCase();
  } else if (hasSong) {
    primary = video.song!.trim().toUpperCase();
  } else {
    primary = (video.artist ?? video.client ?? '').trim().toUpperCase();
  }
  if (!primary && !loc) {
    return video.title?.trim().toUpperCase() ?? null;
  }
  if (!loc) return primary || null;
  if (!primary) return loc;
  return `${primary} | ${loc}`;
}

export function formatVideoSongLocationCaptionFromMediaItem(
  item: SongLocationCaptionFields
): string | null {
  return formatVideoSongLocationCaption(item);
}
