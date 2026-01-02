# Development Guide

This guide covers development workflows, best practices, and common tasks for working on the NOL Videography project.

## Development Workflow

### Starting Development

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - The app will automatically reload on file changes

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write code following the [Code Style Guide](./code-style-guide.md)
   - Use TypeScript for all new files
   - Write clean, readable code

3. **Check code quality:**
   ```bash
   npm run lint        # Check for linting errors
   npm run type-check  # Verify TypeScript types
   npm run format      # Format code with Prettier
   ```

4. **Test your changes:**
   - Manually test in the browser
   - Verify all affected functionality
   - Check responsive design (mobile, tablet, desktop)

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

## Code Quality Checks

### Before Committing

Run these commands to ensure code quality:

```bash
# Format code
npm run format

# Check for linting errors
npm run lint

# Verify TypeScript types
npm run type-check
```

### Pre-commit Hooks (Recommended)

Consider setting up pre-commit hooks using tools like:
- **Husky** - Git hooks made easy
- **lint-staged** - Run linters on staged files

Example setup:
```bash
npm install --save-dev husky lint-staged
```

## Development Best Practices

### Component Development

1. **Start with the structure:**
   - Define props interface
   - Add TypeScript types
   - Write component logic
   - Add styling with Tailwind

2. **Follow the component pattern:**
   ```typescript
   interface ComponentProps {
     title: string;
     onClick: () => void;
   }

   export const Component = ({ title, onClick }: ComponentProps) => {
     return (
       <div>
         <h1>{title}</h1>
         <button onClick={onClick}>Click me</button>
       </div>
     );
   };
   ```

3. **Keep components focused:**
   - Single responsibility principle
   - Small, reusable components
   - Clear prop interfaces

### State Management

1. **Use local state when possible:**
   ```typescript
   const [count, setCount] = useState(0);
   ```

2. **Lift state up when needed:**
   - Share state between sibling components
   - Keep state as local as possible

3. **Use Context for global state:**
   - Only when necessary
   - Keep contexts focused and small

### Data Fetching

1. **Use the API service:**
   ```typescript
   import { apiService } from '@/services/api';

   const data = await apiService.get<DataType>('/endpoint');
   ```

2. **Handle errors:**
   ```typescript
   try {
     const data = await apiService.get('/endpoint');
   } catch (error) {
     if (error instanceof ApiError) {
       // Handle API error
     }
   }
   ```

3. **Use hooks for data fetching:**
   - Create custom hooks for reusable data fetching logic
   - Handle loading and error states

### Styling Guidelines

1. **Use Tailwind CSS utilities:**
   ```typescript
   <div className="flex items-center justify-between p-4">
   ```

2. **Extract repeated patterns:**
   - Create reusable component classes
   - Use Tailwind's `@apply` directive if needed

3. **Follow responsive design:**
   ```typescript
   <div className="w-full md:w-1/2 lg:w-1/3">
   ```

See [Styling Guide](./styling-guide.md) for detailed styling practices.

## Common Tasks

### Adding a New Page

1. **Create the page component:**
   ```typescript
   // src/pages/NewPage.tsx
   export const NewPage = () => {
     return <div>New Page Content</div>;
   };
   ```

2. **Add the route constant:**
   ```typescript
   // src/constants/routes.ts
   export const ROUTES = {
     // ... existing routes
     NEW_PAGE: '/new-page',
   };
   ```

3. **Add the route:**
   ```typescript
   // src/App.tsx
   import { NewPage } from '@/pages/NewPage';

   <Route path="new-page" element={<NewPage />} />
   ```

4. **Add navigation link:**
   ```typescript
   // src/components/layout/Header.tsx
   <Link to={ROUTES.NEW_PAGE}>New Page</Link>
   ```

### Adding a New Component

1. **Create component file:**
   ```typescript
   // src/components/ui/Card.tsx
   interface CardProps {
     children: React.ReactNode;
   }

   export const Card = ({ children }: CardProps) => {
     return <div className="card-styles">{children}</div>;
   };
   ```

2. **Export from index (if in new directory):**
   ```typescript
   // src/components/ui/index.ts
   export * from './Card';
   ```

3. **Use the component:**
   ```typescript
   import { Card } from '@/components/ui';
   ```

### Adding a New Type

1. **Add to types file:**
   ```typescript
   // src/types/index.ts
   export interface NewType {
     id: string;
     name: string;
   }
   ```

2. **Use throughout codebase:**
   ```typescript
   import { NewType } from '@/types';
   ```

### Adding a New Utility Function

1. **Add to utils:**
   ```typescript
   // src/utils/index.ts
   export const newUtility = (input: string): string => {
     return input.toUpperCase();
   };
   ```

2. **Use in components:**
   ```typescript
   import { newUtility } from '@/utils';
   ```

## Debugging

### Browser DevTools

1. **React DevTools:**
   - Install React DevTools browser extension
   - Inspect component tree
   - View props and state

2. **Console Logging:**
   ```typescript
   console.log('Debug value:', value);
   console.table(arrayData);
   ```

3. **Network Tab:**
   - Monitor API requests
   - Check request/response data
   - Verify status codes

### VS Code Debugging

1. **Install Debugger for Chrome extension**
2. **Create launch.json:**
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "chrome",
         "request": "launch",
         "name": "Launch Chrome",
         "url": "http://localhost:5173",
         "webRoot": "${workspaceFolder}/src"
       }
     ]
   }
   ```

## Performance Optimization

### Code Splitting

Routes are automatically code-split. For component-level splitting:

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### Memoization

Use React.memo, useMemo, and useCallback when appropriate:

```typescript
const MemoizedComponent = React.memo(Component);

const memoizedValue = useMemo(() => expensiveCalculation(), [deps]);

const memoizedCallback = useCallback(() => {
  doSomething();
}, [deps]);
```

### Image Optimization

- Use appropriate image formats (WebP, AVIF)
- Optimize image sizes
- Use lazy loading for images below the fold

## Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/code-improvement` - Code refactoring

### Commit Messages

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Example:
```
feat: add video gallery component
fix: resolve navigation issue on mobile
docs: update development guide
```

## Environment Variables

1. **Never commit `.env` files**
2. **Use `.env.example` as a template**
3. **Prefix with `VITE_` for client-side variables**
4. **Document new variables in `.env.example`**

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Vite will automatically use next available port
   # Or specify port: vite --port 3000
   ```

2. **Type errors:**
   ```bash
   npm run type-check
   # Fix type errors before committing
   ```

3. **Lint errors:**
   ```bash
   npm run lint
   # Auto-fix if possible: npm run lint -- --fix
   ```

4. **Build fails:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

See [Troubleshooting](./troubleshooting.md) for more detailed solutions.

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
