import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';
import { useState, useRef, useEffect } from 'react';

/**
 * MinimalNav
 * 
 * Video-First: 5% visual weight, doesn't compete with videos
 * Oliver: Dark, minimal
 * West: Minimal branding, bold when needed
 * Redesign 2: Work dropdown with Videos/Photos options
 */

export const MinimalNav = () => {
  const location = useLocation();
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = useState(false);
  const [isMobileWorkDropdownOpen, setIsMobileWorkDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const workDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Nav items - all always visible
  const isOnHome = location.pathname === ROUTES.HOME || location.pathname === '/';
  const isOnWork = location.pathname === ROUTES.WORK || 
                   location.pathname === ROUTES.WORK_VIDEOS || 
                   location.pathname === ROUTES.WORK_PHOTOS;
  const isOnOther = location.pathname === ROUTES.OTHER;
  const isOnContact = location.pathname === ROUTES.CONTACT;

  const navItems = [
    { path: ROUTES.OTHER, label: 'OTHER', isActive: isOnOther },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workDropdownRef.current && !workDropdownRef.current.contains(event.target as Node)) {
        setIsWorkDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isWorkDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWorkDropdownOpen, isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileWorkDropdownOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-zinc-800/50 transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 py-2 md:py-2.5 flex items-center justify-between relative">
        {/* Logo - Left Side */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="transform rotate-[-0.5deg]"
        >
          <Link 
            to={ROUTES.HOME} 
            className="text-sm md:text-base lg:text-lg font-medium uppercase tracking-tighter block leading-tight text-white transition-all duration-200 min-h-[44px] flex items-center"
          >
            IMANOL VILLAGOMEZ
          </Link>
        </motion.div>

        {/* Hamburger Menu Button - Right Side (Mobile Only) */}
        <motion.button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 min-h-[44px] min-w-[44px] items-center justify-center relative"
          aria-label="Toggle menu"
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="block w-6 h-0.5 bg-white origin-center"
            animate={{
              rotate: isMobileMenuOpen ? 45 : 0,
              y: isMobileMenuOpen ? 6.5 : 0,
            }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-6 h-0.5 bg-white"
            animate={{
              opacity: isMobileMenuOpen ? 0 : 1,
              scale: isMobileMenuOpen ? 0 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-6 h-0.5 bg-white origin-center"
            animate={{
              rotate: isMobileMenuOpen ? -45 : 0,
              y: isMobileMenuOpen ? -6.5 : 0,
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.button>

        {/* Desktop Menu - Hidden on Mobile */}
        <div className="hidden md:flex gap-4 md:gap-6 items-center">
          {/* Home - always visible */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Link
              to={ROUTES.HOME}
              className={cn(
                'text-xs md:text-sm font-medium uppercase tracking-wider transition-colors duration-200 min-h-[44px] flex items-center px-2',
                isOnHome ? 'text-white font-bold' : 'text-white/70 hover:text-white'
              )}
            >
              HOME
            </Link>
          </motion.div>

          {/* Work dropdown - always visible */}
          <div className="relative" ref={workDropdownRef}>
            <motion.div
              className="flex items-center gap-1 cursor-pointer"
              onMouseEnter={() => setIsWorkDropdownOpen(true)}
              onMouseLeave={() => setIsWorkDropdownOpen(false)}
              onClick={() => setIsWorkDropdownOpen(!isWorkDropdownOpen)}
            >
              <span className={cn(
                'text-xs md:text-sm font-medium uppercase tracking-wider transition-colors duration-200 min-h-[44px] flex items-center px-2',
                isOnWork ? 'text-white font-bold' : 'text-white/70 hover:text-white'
              )}>
                WORK
              </span>
              {/* Dropdown indicator - down arrow */}
              <motion.span
                className="text-white text-xs"
                animate={{ rotate: isWorkDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▼
              </motion.span>
            </motion.div>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isWorkDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 bg-black/95 backdrop-blur-sm border border-zinc-800/50 min-w-[120px]"
                  onMouseEnter={() => setIsWorkDropdownOpen(true)}
                  onMouseLeave={() => setIsWorkDropdownOpen(false)}
                >
                  <Link
                    to={ROUTES.WORK_VIDEOS}
                    className={cn(
                      'block px-4 py-2.5 text-xs md:text-sm font-medium uppercase tracking-wider transition-colors duration-200 min-h-[44px] flex items-center',
                      location.pathname === ROUTES.WORK_VIDEOS
                        ? 'text-white font-bold bg-white/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                  >
                    VIDEOS
                  </Link>
                  <Link
                    to={ROUTES.WORK_PHOTOS}
                    className={cn(
                      'block px-4 py-2.5 text-xs md:text-sm font-medium uppercase tracking-wider transition-colors duration-200 border-t border-zinc-800/50 min-h-[44px] flex items-center',
                      location.pathname === ROUTES.WORK_PHOTOS
                        ? 'text-white font-bold bg-white/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                  >
                    PHOTOS
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Other nav items */}
          {navItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 1) * 0.05 }}
            >
              <Link
                to={item.path}
                className={cn(
                  'text-xs md:text-sm font-medium uppercase tracking-wider transition-colors duration-200 min-h-[44px] flex items-center px-2',
                  item.isActive ? 'text-white font-bold' : 'text-white/70 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}

          {/* Contact - CTA button */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to={ROUTES.CONTACT}
              className={cn(
                'text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200',
                'px-4 py-2 border-2 border-white min-h-[44px] flex items-center justify-center',
                isOnContact 
                  ? 'bg-white text-black' 
                  : 'text-white hover:bg-white hover:text-black'
              )}
            >
              CONTACT
            </Link>
          </motion.div>
        </div>

        {/* Mobile Menu Backdrop */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-zinc-800/50 z-40 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="container mx-auto px-4 py-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                {/* Home */}
                <Link
                  to={ROUTES.HOME}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    'block px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 min-h-[44px] flex items-center',
                    isOnHome ? 'text-white font-bold bg-white/10' : 'text-white/70'
                  )}
                >
                  HOME
                </Link>

                {/* Work Section */}
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileWorkDropdownOpen(!isMobileWorkDropdownOpen);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 min-h-[44px]',
                      isOnWork ? 'text-white font-bold bg-white/10' : 'text-white/70'
                    )}
                  >
                    <span>WORK</span>
                    <motion.span
                      className="text-white text-xs"
                      animate={{ rotate: isMobileWorkDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▼
                    </motion.span>
                  </button>

                  {/* Work Dropdown - Mobile */}
                  <AnimatePresence>
                    {isMobileWorkDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={ROUTES.WORK_VIDEOS}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileMenuOpen(false);
                            setIsMobileWorkDropdownOpen(false);
                          }}
                          className={cn(
                            'block px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 min-h-[44px] flex items-center',
                            location.pathname === ROUTES.WORK_VIDEOS
                              ? 'text-white font-bold bg-white/10'
                              : 'text-white/70'
                          )}
                        >
                          VIDEOS
                        </Link>
                        <Link
                          to={ROUTES.WORK_PHOTOS}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileMenuOpen(false);
                            setIsMobileWorkDropdownOpen(false);
                          }}
                          className={cn(
                            'block px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 border-t border-zinc-800/50 min-h-[44px] flex items-center',
                            location.pathname === ROUTES.WORK_PHOTOS
                              ? 'text-white font-bold bg-white/10'
                              : 'text-white/70'
                          )}
                        >
                          PHOTOS
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Other */}
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      'block px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 min-h-[44px] flex items-center',
                      item.isActive ? 'text-white font-bold bg-white/10' : 'text-white/70'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Contact */}
                <Link
                  to={ROUTES.CONTACT}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    'block px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 border-2 border-white min-h-[44px] flex items-center justify-center',
                    isOnContact 
                      ? 'bg-white text-black' 
                      : 'text-white'
                  )}
                >
                  CONTACT
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

