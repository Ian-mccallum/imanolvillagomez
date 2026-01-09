import { motion } from 'framer-motion';

interface VideoLoadingBarProps {
  progress: number; // 0-100
  isLoading: boolean;
}

/**
 * VideoLoadingBar
 * 
 * Shows a loading progress bar for videos that are taking time to load
 * Displays progress based on video buffering progress
 */
export const VideoLoadingBar = ({ progress, isLoading }: VideoLoadingBarProps) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
      <div className="w-full max-w-md px-8">
        {/* Loading text */}
        <div className="text-center mb-4">
          <p className="text-white text-sm font-medium mb-2">Loading video...</p>
          <p className="text-white/60 text-xs">{Math.round(progress)}%</p>
        </div>
        
        {/* Progress bar container */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          {/* Animated progress bar */}
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            }}
          />
        </div>
        
        {/* Pulsing indicator */}
        <div className="mt-4 flex justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

