import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';

export const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: ROUTES.WORK, label: 'Work' },
    { path: ROUTES.ABOUT, label: 'About' },
    { path: ROUTES.CONTACT, label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to={ROUTES.HOME} className="text-2xl font-bold">
            NOL Videography
          </Link>
          <ul className="flex gap-6">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'transition-colors hover:text-gray-600',
                    isActive(item.path) ? 'font-semibold text-black' : 'text-gray-500'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};
