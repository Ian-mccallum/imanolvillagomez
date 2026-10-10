import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { HomePage } from '@/pages/HomePage';
import { WorkHubPage } from '@/pages/WorkHubPage';
import { VideosPage } from '@/pages/VideosPage';
import { PhotosPage } from '@/pages/PhotosPage';
import { OtherPage } from '@/pages/OtherPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { ThankYouPage } from '@/pages/ThankYouPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

// Imanol's upload tool: loaded only when /studio is opened, so its code (drop UI, passkey
// sign-in, uploads) isn't part of every visitor's download.
const StudioPage = lazy(() => import('@/pages/StudioPage').then((m) => ({ default: m.StudioPage })));

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        <Route
          path="studio"
          element={
            <Suspense fallback={<div className="min-h-[100svh] bg-black" />}>
              <StudioPage />
            </Suspense>
          }
        />
        <Route path="art" element={<Navigate to="/studio" replace />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="work" element={<WorkHubPage />} />
          <Route path="work/videos" element={<VideosPage />} />
          <Route path="work/photos" element={<PhotosPage />} />
          <Route path="other" element={<OtherPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="thank-you" element={<ThankYouPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
