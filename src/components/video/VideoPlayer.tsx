import { useRef, useEffect, useState, useCallback } from 'react';
import { MediaItem } from '@/types/media';
import { PlatformInfo as _PlatformInfo } from '@/utils/platform';
import { addFullscreenChangeListener } from '@/utils/fullscreen';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  item: MediaItem;
  platform: _PlatformInfo;
  enableNativeFullscreen?: boolean;
  onLoad: () => void;
  onError: () => void;
  isLoading: boolean;
  hasError: boolean;
  showControls: boolean;
  onControlsToggle: () => void;
}

export const VideoPlayer = ({
  item,
  platform: _platform,
  enableNativeFullscreen = true,
  onLoad,
  onError,
  isLoading,
  hasError,
  showControls,
  onControlsToggle,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  
  const needsRotation = item.rotation === 270;
  
  // Handle video loading and playback
  useEffect(() => {
    if (!videoRef.current || !item.videoUrl) return;
    
    const videoEl = videoRef.current;
    setAutoplayBlocked(false);
    videoEl.load();
    
    const handleCanPlay = () => {
      console.log('Video canplay:', item.videoUrl, {
        duration: videoEl.duration,
        videoWidth: videoEl.videoWidth,
        videoHeight: videoEl.videoHeight,
        readyState: videoEl.readyState,
        networkState: videoEl.networkState
      });
      onLoad();
      videoEl.play().catch((err) => {
        console.warn('Autoplay prevented:', err, item.videoUrl);
        setAutoplayBlocked(true);
        onLoad();
      });
    };
    
    const handleError = (e?: Event) => {
      const video = e?.target as HTMLVideoElement || videoEl;
      const errorCodes: Record<number, string> = {
        1: 'MEDIA_ERR_ABORTED - Video loading aborted',
        2: 'MEDIA_ERR_NETWORK - Network error',
        3: 'MEDIA_ERR_DECODE - Video decoding error (codec not supported)',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported'
      };
      console.error('❌ VIDEO ERROR:', item.videoUrl);
      console.error('   Error Code:', video.error?.code, video.error ? `(${errorCodes[video.error.code] || 'Unknown'})` : 'No error code');
      console.error('   Error Message:', video.error?.message || 'No message');
      console.error('   Network State:', video.networkState);
      console.error('   Ready State:', video.readyState);
      console.error('   Video SRC:', video.src);
      console.error('   Current SRC:', video.currentSrc);
      onError();
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoEl.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(videoEl.duration);
    };
    
    const handleVolumeChange = () => {
      setVolume(videoEl.volume);
      setIsMuted(videoEl.muted);
    };
    
    videoEl.addEventListener('canplay', handleCanPlay, { once: true });
    videoEl.addEventListener('error', (e) => handleError(e), { once: true });
    videoEl.addEventListener('loadstart', () => console.log('Video loadstart:', item.videoUrl));
    videoEl.addEventListener('loadedmetadata', () => console.log('Video loadedmetadata:', item.videoUrl, { duration: videoEl.duration }));
    videoEl.addEventListener('loadeddata', () => console.log('Video loadeddata:', item.videoUrl));
    videoEl.addEventListener('stalled', () => console.warn('Video stalled:', item.videoUrl));
    videoEl.addEventListener('waiting', () => console.warn('Video waiting:', item.videoUrl));
    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoEl.addEventListener('volumechange', handleVolumeChange);
    
    return () => {
      videoEl.removeEventListener('canplay', handleCanPlay);
      videoEl.removeEventListener('error', (e) => handleError(e));
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoEl.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [item.videoUrl, onLoad, onError]);
  
  // Handle native fullscreen
  useEffect(() => {
    if (!enableNativeFullscreen || !videoRef.current) return;
    
    const removeListener = addFullscreenChangeListener(() => {
      if (videoRef.current) {
      }
    });
    
    return removeListener;
  }, [enableNativeFullscreen]);
  
  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    onControlsToggle();
    
    if (videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  }, [onControlsToggle]);
  
  // Handle seek
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);
  
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);
  
  // Format time
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Manual play button (when autoplay is blocked)
  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };
  
  if (!item.videoUrl) return null;
  
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black flex items-center justify-center group"
      style={{
        minWidth: '100%',
        minHeight: '100%',
        width: '100%',
        height: '100%',
      }}
      onClick={togglePlay}
    >
      {/* Loading state */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center p-8">
            <p className="text-white text-lg font-medium mb-2">Failed to load video</p>
            <p className="text-white/60 text-sm">{item.title || 'Video'}</p>
          </div>
        </div>
      )}
      
      {/* Autoplay blocked overlay */}
      {autoplayBlocked && !isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={handlePlayClick}
            className="w-16 h-16 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Play video"
          >
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Video element - NO browser controls */}
      <video
        ref={videoRef}
        src={item.videoUrl}
        autoPlay
        playsInline
        muted={isMuted}
        preload="auto"
        crossOrigin="anonymous"
        className={`w-full h-full ${needsRotation ? 'object-cover' : 'object-contain'} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{
          transform: needsRotation ? 'rotate(270deg) scale(1.2)' : 'none', // Scale to fill screen after rotation, reduced zoom
          transformOrigin: 'center center',
        }}
        onError={(e) => {
          const video = e.currentTarget;
          const errorCodes: Record<number, string> = {
            1: 'MEDIA_ERR_ABORTED - Video loading aborted',
            2: 'MEDIA_ERR_NETWORK - Network error',
            3: 'MEDIA_ERR_DECODE - Video decoding error (codec not supported)',
            4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported'
          };
          console.error('Video error:', {
            code: video.error?.code,
            codeName: video.error ? errorCodes[video.error.code] || 'Unknown error' : 'No error code',
            message: video.error?.message,
            src: video.src,
            networkState: video.networkState,
            readyState: video.readyState,
            videoUrl: item.videoUrl
          });
          onError();
        }}
        onLoadedData={onLoad}
        onLoadStart={() => console.log('Video loadstart:', item.videoUrl)}
        onLoadedMetadata={() => console.log('Video loadedmetadata:', item.videoUrl)}
        onCanPlay={() => console.log('Video canplay:', item.videoUrl)}
        aria-label={item.title || 'Video'}
      />
      
      {/* Custom Video Controls Overlay */}
      <AnimatePresence>
        {showControls && !isLoading && !hasError && !autoplayBlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 pointer-events-none z-30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Center Play/Pause Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all pointer-events-auto focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 pointer-events-auto">
              {/* Progress Bar - Video playback progress */}
              <div
                className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group/progress"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-white rounded-full transition-all relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                </div>
              </div>
              
              {/* Controls Row */}
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="w-10 h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                
                {/* Time Display */}
                <div className="text-white text-sm font-medium tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                
                {/* Volume Control - Mute button only (no slider) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="w-10 h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
