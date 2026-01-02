# Write Tests

## Overview

**Tests are promises.** Based on everything above, write comprehensive tests that guarantee the code works and will keep working. Every test is a contract with your future self—and a promise that the creative work will function flawlessly.

## Your Mission

Review ALL code written above and test it ruthlessly. If code was written, tests must follow. No exceptions. No shortcuts. This is how we ship with confidence, even for a creative portfolio site.

## Steps

1. **Identify what was built above**
   - New components, pages, hooks, utilities
   - Modified existing functionality
   - Edge cases mentioned or implied
   - User interactions and flows

2. **Write tests that matter** (AAA: Arrange-Act-Assert)
   - Components: `src/components/**/*.test.{ts,tsx}`
   - Pages: `src/pages/**/*.test.{ts,tsx}`
   - Hooks: `src/hooks/**/*.test.ts`
   - Utils: `src/utils/**/*.test.ts`
   - Services: `src/services/**/*.test.ts`

3. **Run and verify**
   - `npm test` or `npm run test`
   - **All tests pass. No exceptions.**

## Test Categories Required

- [ ] **Happy path**: The golden road works flawlessly
- [ ] **Edge cases**: Boundaries don't break us (empty states, null values)
- [ ] **Error paths**: Failures are graceful and informative
- [ ] **User interactions**: Clicks, hovers, keyboard navigation work
- [ ] **Responsive behavior**: Components work across screen sizes
- [ ] **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## Testing Tools & Setup

### Recommended Stack

- **Vitest** or **Jest** - Test runner
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - DOM matchers

### Example Test Structure

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<ComponentName />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Result')).toBeInTheDocument();
  });

  it('handles edge cases', () => {
    render(<ComponentName data={null} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});
```

## Quality Standards

- **Deterministic**: Same result, every time, no excuses
- **Independent**: No test depends on another
- **Fast**: Mock external dependencies ruthlessly
- **Readable**: Future you should understand in seconds
- **Focused**: Test one thing per test case

## Component Testing Guidelines

### What to Test

- **Rendering**: Component renders without errors
- **Props**: Component handles props correctly
- **User interactions**: Clicks, form submissions, navigation
- **State changes**: Component state updates correctly
- **Conditional rendering**: Shows/hides content based on state
- **Accessibility**: ARIA attributes, keyboard navigation

### What NOT to Test

- Implementation details (internal state, methods)
- Third-party library behavior (React, React Router, etc.)
- CSS styling (use visual regression tests if needed)

## Video Component Testing

When testing video-related components:

- **Loading states**: Video loading, error states
- **Playback controls**: Play, pause, seek functionality
- **Embedding**: Iframe/video tag renders correctly
- **Accessibility**: Captions, keyboard controls
- **Performance**: Lazy loading, thumbnail loading

## Hook Testing

For custom hooks:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  it('returns expected initial value', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe('initial');
  });

  it('updates value correctly', () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.updateValue('new');
    });
    
    expect(result.current.value).toBe('new');
  });
});
```

## Utility Function Testing

For utility functions:

```tsx
import { formatDate, validateEmail } from './utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate(new Date('2024-01-01'))).toBe('Jan 1, 2024');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

## Integration Testing

For user flows:

- **Navigation**: Routes work correctly
- **Form submissions**: Contact forms, search, filters
- **Video playback**: Video gallery interactions
- **Responsive behavior**: Mobile/tablet/desktop flows

## Accessibility Testing

- **Screen reader**: Test with screen reader tools
- **Keyboard navigation**: Tab through interactive elements
- **ARIA attributes**: Verify correct ARIA labels/roles
- **Focus management**: Focus moves logically

## Performance Testing

Consider testing:
- **Lazy loading**: Components load when needed
- **Image optimization**: Images load efficiently
- **Video loading**: Videos don't block initial render
- **Bundle size**: Code splitting works

## Test Organization

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   └── useLocalStorage.test.ts
└── utils/
    ├── index.ts
    └── index.test.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Button.test.tsx
```

## References

- [React Testing Library](https://testing-library.com/react)
- [Vitest](https://vitest.dev/) or [Jest](https://jestjs.io/)
- `documentation/development-guide.md` - Development practices

**Test everything above. Every test you skip is a bug that could break the creative experience. Test with the same care you put into the creative work.**
