import { Outlet, useLocation } from 'react-router-dom';
import { MinimalNav } from './MinimalNav';
import { Footer } from './Footer';
import { InstagramPromoStrip } from './InstagramPromoStrip';
import { ROUTES } from '@/constants';

const INSTAGRAM_STRIP_ROUTES: readonly string[] = [
  ROUTES.WORK_VIDEOS,
  ROUTES.WORK_PHOTOS,
  ROUTES.CONTACT,
];

/**
 * Layout
 * 
 * Video-First: Minimal layout, dark background
 * Oliver: Dark canvas for videos with video background
 * Homepage: No nav bar (homepage has its own centered navigation)
 */

export const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === ROUTES.HOME || location.pathname === '/';
  const isOtherPage = location.pathname === ROUTES.OTHER;
  const showInstagramStrip = INSTAGRAM_STRIP_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen text-text-dark relative overflow-x-hidden flex flex-col" style={{ backgroundColor: '#C9C8C7' }}>
      {/* Hide nav on homepage - homepage has its own centered navigation */}
      {!isHomePage && <MinimalNav />}
      <main className={`relative z-10 flex-1 ${!isHomePage ? 'pt-12 md:pt-14' : ''}`}>
        <Outlet />
      </main>
      {/* Hide footer on homepage for full immersive experience */}
      {!isHomePage && showInstagramStrip && <InstagramPromoStrip />}
      {!isHomePage && !isOtherPage && <Footer />}
    </div>
  );
};
