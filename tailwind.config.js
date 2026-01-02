/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BACKGROUND: Off-white (Redesign 2)
        'bg-offwhite': '#C9C8C7',        // Off-white - main background
        'bg-offwhite-light': '#E5E5E4',  // Lighter off-white for sections
        'bg-offwhite-dark': '#D4D4D4',   // Medium gray for depth
        
        // TEXT: Dark on light (Redesign 2 - inverted)
        'text-dark': '#000000',          // Pure black - maximum contrast
        'text-dark-secondary': '#1F1F1F', // Dark gray - body text
        'text-dark-tertiary': '#525252',  // Medium gray - muted text
        'text-dark-muted': '#737373',     // Light gray - tertiary text
        
        // PRIMARY: Clean, minimal (West-inspired - black/white)
        'accent': '#ffffff',          // White - primary accent
        'accent-hover': '#f5f5f5',   // Light gray - hover state
        
        // GORE CORE: Dark, aggressive (Oliver-inspired)
        'red-primary': '#dc2626',     // red-600 - Blood red (primary accent)
        'red-bright': '#ef4444',     // red-500 - Bright red (hover)
        'red-dark': '#b91c1c',       // red-700 - Darker red
        'red-gore': '#dc2626',       // Alias for gore core red
        
        // INDIE SLEAZE: Saturated, high contrast (Carson-inspired)
        'pink-sleaze': '#ec4899',     // pink-500 - Bright pink (indie sleaze)
        'pink-600': '#db2777',        // Deeper pink
        'purple-500': '#a855f7',      // Electric purple
        'yellow-400': '#facc15',      // High contrast, attention-grabbing
        
        // BRAT GREEN: Iconic accent (Brat-inspired)
        'green-500': '#22c55e',       // Iconic green (Brat-inspired)
        'green-400': '#4ade80',       // Lighter green (highlights)
        'green-600': '#16a34a',       // Darker green (depth)
        
        // GLITCH/DIGITAL: Experimental (Weirdcore-inspired)
        'cyan-400': '#22d3ee',        // Digital, electric (Aphex Twin)
        'magenta-500': '#d946ef',     // Bold, unexpected
        
        // NEUTRAL: Dark, cinematic (Oliver - darkness as canvas)
        'zinc-darkest': '#18181b',    // zinc-900 - Almost black (subtle depth)
        'zinc-darker': '#27272a',     // zinc-800 - Dark gray (secondary surfaces)
        'zinc-dark': '#3f3f46',       // zinc-700 - Medium gray
        
        // TEXT: High contrast, bold
        'text-primary': '#ffffff',    // Maximum contrast white
        'text-secondary': '#f4f4f5',  // Soft white (body text)
        'text-tertiary': '#a1a1aa',   // Muted (tertiary text)
      },
      fontFamily: {
        // Experimental typography fonts
        'handwritten': ['var(--font-handwritten)', 'cursive'],
        'gothic': ['var(--font-gothic)', 'serif'],
        'display': ['var(--font-display)', 'sans-serif'],
      },
      fontSize: {
        // Oversized headlines (West + Carson - bold minimalism + experimental)
        'massive': ['8rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'huge': ['6rem', { lineHeight: '1', letterSpacing: '-0.01em' }],
        'display': ['4rem', { lineHeight: '1', letterSpacing: '-0.01em' }], // Display size
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'wider': '0.1em',
        'widest': '0.2em',
      },
      rotate: {
        'neg5': '-5deg',
        'neg2': '-2deg',
        'neg1': '-1deg',
        'neg05': '-0.5deg',
        '05': '0.5deg',
        '1': '1deg',
        '2': '2deg',
        '5': '5deg',
      },
      skew: {
        'neg5': '-5deg',
        'neg2': '-2deg',
        'neg1': '-1deg',
      },
      animation: {
        // Glitch animations (Weirdcore)
        'glitch': 'glitch 0.3s ease-in-out',
        'glitch-slow': 'glitch 0.5s ease-in-out',
        // Experimental reveals
        'reveal': 'reveal 0.5s ease-out',
        'sleaze': 'sleaze 0.4s ease-out',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-2px)' },
          '40%': { transform: 'translateX(2px)' },
          '60%': { transform: 'translateX(-1px)' },
          '80%': { transform: 'translateX(1px)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        sleaze: {
          '0%': { opacity: '0', filter: 'blur(2px)' },
          '100%': { opacity: '1', filter: 'blur(0px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
