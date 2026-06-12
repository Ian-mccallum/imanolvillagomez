import { ProtectedEmailReveal } from '@/components/contact/ProtectedEmailReveal';
import { SubpageHeader } from '@/components/layout/SubpageHeader';
import { usePageTitle, useMetaTags } from '@/hooks';
import { SEO_CONFIG, BASE_URL } from '@/constants';
import { PAGE_FILM_GRAIN_OPACITY, PAGE_FILM_GRAIN_SVG } from '@/constants/pageFilmGrain';
import { StructuredData, createBreadcrumbSchema, createFAQSchema } from '@/components/seo/StructuredData';

/**
 * ContactPage — email via protected multi-step reveal (no form).
 */

export const ContactPage = () => {
  const seoConfig = SEO_CONFIG.contact;
  usePageTitle('Contact');
  useMetaTags({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Contact', url: `${BASE_URL}${seoConfig.path}` },
  ]);

  const faqSchema = createFAQSchema([
    {
      question: 'What services does IMANOL VILLAGOMEZ offer?',
      answer:
        'IMANOL VILLAGOMEZ offers professional music videography services including concert footage, music video production, tour documentation, and photography.',
    },
    {
      question: 'How can I contact IMANOL VILLAGOMEZ?',
      answer:
        'Use the Contact page: complete the verification steps to reveal the work email. That helps limit automated scraping.',
    },
    {
      question: 'What types of events does IMANOL VILLAGOMEZ film?',
      answer:
        'IMANOL VILLAGOMEZ specializes in music industry events including concerts, tours, music video production, and behind-the-scenes documentation.',
    },
  ]);

  return (
    <>
      <StructuredData data={[breadcrumbSchema, faqSchema]} />
      <div className="min-h-screen bg-black text-white relative -mt-12 md:-mt-14">
        {(
          [
            { blend: 'overlay' as const, bg: PAGE_FILM_GRAIN_SVG.layer1 },
            { blend: 'multiply' as const, bg: PAGE_FILM_GRAIN_SVG.layer2 },
            { blend: 'screen' as const, bg: PAGE_FILM_GRAIN_SVG.layer3 },
          ] as const
        ).map((layer, i) => (
          <div
            key={i}
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: layer.bg,
              mixBlendMode: layer.blend,
              opacity: PAGE_FILM_GRAIN_OPACITY[i],
            }}
          />
        ))}

        <div className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8 md:pb-12 lg:pb-16 relative z-10">
          <div className="max-w-3xl mx-auto">
            <header className="mb-8 md:mb-12">
              <SubpageHeader title="CONTACT" subtitle="LETS CREATE ART" />
            </header>

            <ProtectedEmailReveal />
          </div>
        </div>
      </div>
    </>
  );
};
