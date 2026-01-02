/**
 * TornEdge
 * 
 * Creates torn paper edge effect for collage aesthetic
 * Oliver-inspired: Distressed textures
 */

interface TornEdgeProps {
  position?: 'top' | 'bottom' | 'left' | 'right' | 'all';
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

export const TornEdge = ({ position: _position = 'all', intensity = 'medium', className = '' }: TornEdgeProps) => {
  const intensityClasses = {
    subtle: 'opacity-20',
    medium: 'opacity-40',
    strong: 'opacity-60',
  };

  // Create more pronounced torn edge effect for paper cutout
  const getTornEdgeStyle = () => {
    const variations = [
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 92%, 97% 94%, 100% 96%, 94% 98%, 100% 100%, 0 100%, 0 98%, 3% 96%, 0 94%, 6% 92%, 0 0)',
        shadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
      },
      {
        clipPath: 'polygon(0 2%, 2% 0, 100% 0, 100% 96%, 98% 98%, 100% 100%, 0 100%, 0 98%, 2% 96%, 0 0)',
        shadow: 'inset 0 0 15px rgba(0,0,0,0.2)',
      },
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 94%, 96% 96%, 100% 98%, 95% 100%, 0 100%, 0 98%, 4% 96%, 0 94%, 5% 92%, 0 0)',
        shadow: 'inset 0 0 25px rgba(0,0,0,0.4)',
      },
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  };

  const edgeStyle = getTornEdgeStyle();

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${intensityClasses[intensity]} ${className}`}
      style={{
        clipPath: edgeStyle.clipPath,
        boxShadow: edgeStyle.shadow,
        background: 'linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.15) 50%, transparent 60%)',
      }}
    />
  );
};

