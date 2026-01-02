# Redesign 2 - Color System

## Primary Background

```typescript
// NEW: Off-white background (major shift)
'background-primary': '#C9C8C7',  // Off-white - main background
'background-secondary': '#E5E5E4', // Lighter off-white for sections
'background-tertiary': '#D4D4D4',  // Medium gray for depth
```

## Text Colors (Inverted)

```typescript
// Text on light background
'text-primary': '#000000',        // Pure black - maximum contrast
'text-secondary': '#1F1F1F',     // Dark gray - body text
'text-tertiary': '#525252',       // Medium gray - muted text
'text-muted': '#737373',          // Light gray - tertiary text
```

## Accent Colors (Maintained)

```typescript
// GORE CORE: Dark, aggressive (Oliver-inspired)
'red-primary': '#dc2626',         // red-600 - Blood red
'red-bright': '#ef4444',          // red-500 - Bright red
'red-dark': '#b91c1c',            // red-700 - Darker red
'red-gore': '#dc2626',            // Alias for gore core red

// BRAT GREEN: Iconic accent (Brat-inspired)
'green-500': '#22c55e',           // Iconic green
'green-400': '#4ade80',           // Lighter green
'green-600': '#16a34a',           // Darker green

// INDIE SLEAZE: Saturated, high contrast
'pink-sleaze': '#ec4899',         // pink-500 - Bright pink
'pink-600': '#db2777',            // Deeper pink
'purple-500': '#a855f7',          // Electric purple
'yellow-400': '#facc15',          // High contrast yellow

// GLITCH/DIGITAL: Experimental (Weirdcore-inspired)
'cyan-400': '#22d3ee',            // Digital, electric
'magenta-500': '#d946ef',         // Bold, unexpected
```

## Usage Guidelines

### Background
- **Primary**: Use `#C9C8C7` for main page backgrounds
- **Sections**: Use `#E5E5E4` for card/section backgrounds
- **Depth**: Use `#D4D4D4` for subtle depth/shadows

### Text
- **Headlines**: Use `#000000` (pure black) for maximum impact
- **Body**: Use `#1F1F1F` (dark gray) for readability
- **Muted**: Use `#525252` or `#737373` for secondary info

### Accents
- **Red**: Use for gore core elements, borders, highlights
- **Green**: Use for brat-inspired accents, CTAs
- **Pink/Purple**: Use for indie sleaze elements
- **Cyan/Magenta**: Use for glitch effects, digital artifacts

### Contrast Rules
- **Minimum**: Ensure WCAG AA contrast (4.5:1 for text)
- **Headlines**: Can use pure black for maximum impact
- **Body Text**: Use dark gray for comfortable reading
- **Accents**: Use bright colors sparingly for impact

## Color Combinations

### High Impact
- Black text on off-white background
- Red accents on off-white
- Green accents on off-white

### Subtle
- Dark gray text on off-white
- Medium gray borders on off-white
- Light gray backgrounds for sections

### Experimental
- Glitch effects with cyan/magenta
- Indie sleaze with pink/purple
- Gore core with red on light background

## Implementation

```typescript
// Tailwind config additions
colors: {
  'bg-offwhite': '#C9C8C7',
  'bg-offwhite-light': '#E5E5E4',
  'bg-offwhite-dark': '#D4D4D4',
  'text-dark': '#000000',
  'text-dark-secondary': '#1F1F1F',
  'text-dark-tertiary': '#525252',
  // ... existing accent colors
}
```

