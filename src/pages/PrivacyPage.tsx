import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlitchText } from '@/components/ui/GlitchText';
import { ROUTES, SEO_CONFIG, BASE_URL } from '@/constants';
import { usePageTitle, useMetaTags } from '@/hooks';
import { StructuredData, createBreadcrumbSchema } from '@/components/seo/StructuredData';

/**
 * PrivacyPage
 * 
 * Carson: Experimental typography on headers, break traditional legal page conventions
 * Oliver: Dark canvas with intense grain texture, gothic beauty
 * West: Minimalist perfectionism, bold statements, clean readable body text
 * Weirdcore: Subtle glitch effects on section headers
 * 
 * Features:
 * - Dark background with intense grain texture (matching Contact, Photos, Lost Files)
 * - Experimental typography for headers (Carson)
 * - Readable body text for legal content (West's minimal perfectionism)
 * - Subtle glitch effects on section dividers (Weirdcore)
 * - Bold, memorable design while maintaining readability
 */

export const PrivacyPage = () => {
  const seoConfig = SEO_CONFIG.privacy;
  usePageTitle('Privacy Policy');
  useMetaTags({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
  });

  // Breadcrumb schema
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Privacy Policy', url: `${BASE_URL}${seoConfig.path}` },
  ]);
  
  const sections = [
    {
      id: 'introduction',
      title: 'INTRODUCTION',
      content: `This Privacy Policy ("Policy") describes how IMANOL VILLAGOMEZ, a sole proprietorship operating from Aurora, Illinois ("we," "our," or "us"), collects, uses, discloses, and protects your personal information when you visit our website at nolvideography.com (the "Website"). This Policy applies to all visitors and users of our Website. By using our Website, you agree to the collection and use of information in accordance with this Policy. If you do not agree with this Policy, please do not use our Website.`
    },
    {
      id: 'information-collection',
      title: 'INFORMATION WE COLLECT',
      content: `We collect information that you provide directly to us and information that is automatically collected when you visit our Website.

INFORMATION YOU PROVIDE DIRECTLY:
Contact Form Information: When you submit our contact form, we collect your name, email address, subject (optional), and message content. This information is processed by FormSubmit, a third-party form submission service, which forwards your submission to our email address (imanolV20@icloud.com).

AUTOMATICALLY COLLECTED INFORMATION:
Browser Local Storage: We use browser local storage to remember your acknowledgment of our epilepsy warning. This stores a simple boolean value indicating whether you have acknowledged the warning. This information is stored locally on your device and is not transmitted to our servers.

Device and Usage Information: When you visit our Website, your browser automatically provides certain information, including your IP address, browser type, operating system, device information, and pages you visit. This information is collected through standard web server logs and may be used for security purposes and to improve our Website functionality.`
    },
    {
      id: 'how-we-use',
      title: 'HOW WE USE YOUR INFORMATION',
      content: `We use the information we collect for the following purposes:

• To respond to your inquiries and communications submitted through our contact form
• To provide and maintain our Website functionality
• To remember your preferences (such as epilepsy warning acknowledgment) using local storage
• To improve our Website and user experience
• To comply with legal obligations and protect our legal rights
• To prevent fraud, abuse, or other harmful activities

We do not sell, rent, trade, or otherwise share your personal information with third parties for their marketing purposes.`
    },
    {
      id: 'third-party-services',
      title: 'THIRD-PARTY SERVICES',
      content: `Our Website uses the following third-party service:

FORMSUBMIT: Our contact form is processed through FormSubmit (formsubmit.co), a third-party form submission service. When you submit our contact form, FormSubmit temporarily processes your submission and forwards it to our email address. According to FormSubmit's privacy practices, they do not permanently store form submission data; submissions are immediately forwarded to the designated email address and then deleted from their servers. Your use of our contact form is subject to FormSubmit's privacy policy and terms of service.

We do not control FormSubmit's data practices, and we encourage you to review their privacy policy to understand how they handle your information.`
    },
    {
      id: 'cookies',
      title: 'COOKIES & LOCAL STORAGE',
      content: `Our Website uses browser local storage (not cookies) to store a simple preference setting:

LOCAL STORAGE: We use browser local storage to remember your acknowledgment of our epilepsy warning. This stores a boolean value ("epilepsy-warning-acknowledged") on your device. This data is stored locally on your device and is not transmitted to our servers. You can clear this data at any time by clearing your browser's local storage.

Our Website does not currently use cookies, web beacons, or other tracking technologies. We do not use analytics services, advertising networks, or other third-party tracking tools.`
    },
    {
      id: 'data-retention',
      title: 'DATA RETENTION',
      content: `We retain the personal information we collect as follows:

CONTACT FORM SUBMISSIONS: We retain contact form submissions received via email indefinitely, unless you request deletion. You may request deletion of your information at any time by contacting us at imanolV20@icloud.com.

LOCAL STORAGE DATA: Local storage data remains on your device until you clear your browser's local storage or use a different device/browser.

SERVER LOGS: Standard web server logs containing IP addresses and other automatically collected information are typically retained for a reasonable period for security and operational purposes.

You have the right to request deletion of your personal information at any time.`
    },
    {
      id: 'data-security',
      title: 'DATA SECURITY',
      content: `We implement reasonable security measures designed to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security. You use our Website and provide information at your own risk.

When you submit our contact form through FormSubmit, your information is transmitted over the Internet. FormSubmit uses industry-standard security measures, but we cannot guarantee the security of information transmitted through third-party services.`
    },
    {
      id: 'your-rights',
      title: 'YOUR PRIVACY RIGHTS',
      content: `Depending on your location, you may have certain rights regarding your personal information:

GENERAL RIGHTS (ALL USERS):
• Right to Access: You have the right to request access to the personal information we hold about you.
• Right to Correction: You have the right to request correction of inaccurate or incomplete personal information.
• Right to Deletion: You have the right to request deletion of your personal information.
• Right to Object: You have the right to object to certain processing of your personal information.

CALIFORNIA RESIDENTS (CCPA/CPRA RIGHTS):
If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
• Right to Know: You have the right to know what personal information we collect, use, disclose, and sell (we do not sell personal information).
• Right to Delete: You have the right to request deletion of your personal information.
• Right to Correct: You have the right to request correction of inaccurate personal information.
• Right to Opt-Out: You have the right to opt-out of the sale or sharing of personal information (we do not sell or share personal information for commercial purposes).
• Right to Non-Discrimination: We will not discriminate against you for exercising your privacy rights.

EXERCISING YOUR RIGHTS:
To exercise any of these rights, please contact us at imanolV20@icloud.com with your request. We will respond to your request within the timeframes required by applicable law (typically 30-45 days). We may need to verify your identity before processing your request.`
    },
    {
      id: 'children',
      title: 'CHILDREN\'S PRIVACY',
      content: `Our Website is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at imanolV20@icloud.com and we will delete such information from our records.`
    },
    {
      id: 'do-not-track',
      title: 'DO NOT TRACK SIGNALS',
      content: `Our Website does not respond to "Do Not Track" (DNT) signals from web browsers. Because we do not use tracking technologies, cookies, or analytics services, DNT signals are not applicable to our Website's current functionality.`
    },
    {
      id: 'changes',
      title: 'CHANGES TO THIS POLICY',
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other reasons. We will notify you of any material changes by posting the updated Policy on this page with a new "Last Updated" date. Your continued use of our Website after such changes constitutes your acceptance of the updated Policy. We encourage you to review this Policy periodically to stay informed about how we protect your information.`
    },
    {
      id: 'contact',
      title: 'CONTACT US',
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:

EMAIL: imanolV20@icloud.com

BUSINESS OWNER: IMANOL VILLAGOMEZ
LOCATION: Aurora, Illinois, United States

We will respond to your inquiries and requests as promptly as possible and in accordance with applicable privacy laws.`
    }
  ];


  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="min-h-screen bg-black text-white relative -mt-12 md:-mt-14">
      {/* Oliver: Very intense grainy background texture - multiple layers */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='5.0' numOctaves='12' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          opacity: 1,
        }}
      />
      
      {/* Second grain layer - more intensity */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='8.0' numOctaves='15' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply',
          opacity: 0.9,
        }}
      />
      
      {/* Third grain layer - maximum intensity */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='10.0' numOctaves='18' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter3)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'screen',
          opacity: 0.7,
        }}
      />

      <div className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8 md:pb-12 lg:pb-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header - Carson: Experimental typography, West: Bold minimalism */}
          <motion.div
            className="mb-12 md:mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <GlitchText intensity="medium">PRIVACY</GlitchText>
            </motion.h1>
            <motion.p
              className="text-zinc-300 text-sm md:text-base uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.p>
          </motion.div>

          {/* Content Sections */}
          <div className="space-y-12 md:space-y-16">
            {sections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: "easeOut" }}
              >
                {/* Carson: Experimental typography for section headers */}
                <motion.h2
                  className="text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter mb-6"
                  whileHover={{ x: [0, -2, 2, 0], transition: { duration: 0.2 } }}
                >
                  {section.title}
                </motion.h2>

                {/* Weirdcore: Subtle glitch divider */}
                <div className="relative mb-6">
                  <div className="h-px bg-white/20" />
                  <motion.div
                    className="absolute top-0 left-0 h-px bg-white/40"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                  />
                </div>

                {/* West: Minimal, readable body text */}
                <div className="text-base md:text-lg text-zinc-200 leading-relaxed font-medium whitespace-pre-line">
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Back Link - West: Minimal, bold */}
          <motion.div
            className="mt-16 md:mt-20 pt-8 md:pt-12 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors duration-200 font-medium uppercase tracking-wider text-sm md:text-base"
            >
              <span>←</span>
              <span>CONTACT</span>
            </Link>
          </motion.div>
        </div>
      </div>
      </div>
    </>
  );
};

