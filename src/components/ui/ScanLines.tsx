/**
 * ScanLines
 * 
 * Weirdcore-inspired: CRT scan line effect
 * Digital artifact overlay
 */

interface ScanLinesProps {
  intensity?: 'subtle' | 'medium' | 'strong';
  speed?: 'slow' | 'normal' | 'fast';
}

export const ScanLines = ({ intensity = 'medium', speed = 'normal' }: ScanLinesProps) => {
  const intensityClasses = {
    subtle: 'opacity-10',
    medium: 'opacity-20',
    strong: 'opacity-30',
  };

  const speedClasses = {
    slow: 'animate-[scan_8s_linear_infinite]',
    normal: 'animate-[scan_4s_linear_infinite]',
    fast: 'animate-[scan_2s_linear_infinite]',
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${intensityClasses[intensity]} ${speedClasses[speed]}`}
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255, 255, 255, 0.05) 2px,
          rgba(255, 255, 255, 0.05) 4px
        )`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

