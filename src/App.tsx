import { Routes, Route } from 'react-router-dom';
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
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
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
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
