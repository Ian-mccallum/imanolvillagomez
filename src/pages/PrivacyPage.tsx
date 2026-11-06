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
  
  // Update both dates (and the text below) whenever the policy changes. A fixed date is required:
  // California's CalOPPA asks for a real effective date, not the date the page happens to be viewed.
  const LAST_UPDATED = 'November 5, 2026';

  const sections = [
    {
      id: 'introduction',
      title: 'WHO WE ARE',
      content: `This policy explains what happens to your information when you visit www.imanolvillagomez.com (the "site").

The site is run by Imanol Villagomez, a videographer and photographer working as a sole proprietor from Aurora, Illinois, in the Chicago area. When this policy says "we," "us" or "our," it means Imanol. For visitors in the European Union and the United Kingdom, Imanol is the "controller" of the personal information described here.

This policy is effective as of ${LAST_UPDATED}. We've kept it short and in plain English. If anything is unclear, just ask (see "Contact Us" at the bottom).`
    },
    {
      id: 'summary',
      title: 'THE SHORT VERSION',
      content: `• The site has no accounts, no sign-up forms, no ads and no social media trackers.
• We count visits with Vercel Web Analytics. It doesn't use cookies and doesn't build a profile of you.
• If you email us, we receive what you send and use it to reply.
• The companies that host and deliver the site see technical details, like your IP address, so they can show you pages and keep the site secure.
• We don't sell your personal information or share it for targeted advertising.
• We don't collect biometric information.`
    },
    {
      id: 'information-collection',
      title: 'WHAT WE COLLECT AND WHY',
      content: `INFORMATION YOU SEND US:
If you email us (the Contact page shows our address after a few quick checks), we receive your email address, your name if you include it, your message and anything you attach. We use it to answer you, to discuss and plan work with you, and to keep a record of our conversations. The checkbox and math question on the Contact page are checked in your browser. Your answers are never sent to us.

INFORMATION COLLECTED AUTOMATICALLY:
• Visit statistics. When you view a page, Vercel Web Analytics records the page address, the website that sent you here, your approximate location (worked out from your IP address), your browser, operating system and device type, and the time. See "Analytics" below.
• Technical request data. Every time your browser loads a page, image or video, it sends our hosting and delivery providers standard technical information: your IP address, browser type, the address requested, the page you came from and the time. They use it to deliver the content, keep the site fast and working, and protect it from abuse. They may keep it in server logs.
• A bot check on the Contact page. Before it shows our email address, the Contact page runs Cloudflare Turnstile. Turnstile looks at limited technical signals, such as your IP address and browser details, to tell people apart from automated bots that harvest email addresses.

WHAT WE DON'T COLLECT:
We don't ask for or collect payment details, government ID numbers, passwords, precise location or biometric information from visitors.`
    },
    {
      id: 'analytics',
      title: 'ANALYTICS',
      content: `We use Vercel Web Analytics to understand, in total, how people use the site: which pages are popular, how visitors find us and what kinds of devices they use. That helps us decide what work to show and keep the site working well.

HOW IT PROTECTS YOUR PRIVACY:
• No cookies. It doesn't place cookies or similar identifiers on your device.
• No profiles. To count unique visitors, Vercel creates a temporary code from details of your request (a "hash"). Vercel discards it after 24 hours, so it can't follow you from one day to the next.
• No cross-site tracking. Vercel says Web Analytics doesn't collect identifiers that link your activity across different websites or apps.
• Totals only. We see numbers like "120 visitors from Canada this week." We can't see who you are, and we don't try to find out.
• Limited scope. We've set it to run only on the public site, not on our private tools, and to remove extra details from web addresses before they're sent. The exception is standard campaign tags (like "utm_source"), which tell us which link brought you here.

We may save daily summaries of these totals, such as page view counts, top pages, referring websites, countries and device types, so we can see trends over time. These summaries contain no information about individual visitors.

WANT TO OPT OUT?
Turn on "Global Privacy Control" or "Do Not Track" in your browser, and the site won't load analytics for you (see below). Privacy extensions and content blockers that block analytics scripts work too. The site works the same either way.

Learn more: vercel.com/docs/analytics/privacy-policy`
    },
    {
      id: 'third-party-services',
      title: 'SERVICE PROVIDERS',
      content: `We rely on a few companies to run the site. Each receives only what it needs to provide its service, and handles that information under its own privacy policy:

• Vercel Inc. hosts the site and provides Web Analytics. vercel.com/legal/privacy-policy
• Cloudflare, Inc. sits in front of the site and our video files to deliver them quickly and protect them from attacks. It also runs the Turnstile bot check on the Contact page. cloudflare.com/privacypolicy and cloudflare.com/turnstile-privacy-policy
• Google LLC supplies one of the site's typefaces through Google Fonts. Loading the font sends your IP address and browser details to Google. Google says the Google Fonts service doesn't set cookies. developers.google.com/fonts/faq/privacy
• Apple Inc. provides our email through iCloud Mail, so emails you send us are stored by Apple. apple.com/legal/privacy

We may also use Google Search Console to see how the site appears in Google Search results, such as which searches showed it. That information comes from Google Search itself. We don't add any Google tracking code to this site.

We may disclose information if the law requires it, or if we need to protect our rights, safety or property, or someone else's. We don't sell personal information. We don't share it with anyone for their own marketing or for targeted advertising.`
    },
    {
      id: 'cookies',
      title: 'COOKIES & LOCAL STORAGE',
      content: `This site doesn't set cookies, and our analytics don't use them.

The public site doesn't currently save anything in your browser's local storage either. If we ever use it to remember a simple setting, that data will stay on your device and won't be sent to us. You can clear it at any time in your browser settings.

Two notes so you have the full picture:
• Cloudflare may, in rare cases, set a strictly necessary security cookie, for example after checking that a visitor isn't a bot during an attack. It's used only for security.
• The Turnstile bot check on the Contact page runs inside a small Cloudflare frame. Cloudflare states that Turnstile doesn't use cookies to collect or store information.`
    },
    {
      id: 'do-not-track',
      title: 'DO NOT TRACK & GLOBAL PRIVACY CONTROL',
      content: `Some browsers can send a "Do Not Track" (DNT) or "Global Privacy Control" (GPC) signal. These signals ask websites not to track you across sites, or not to sell or share your information.

We don't track visitors across other websites. We don't sell personal information or share it for targeted advertising. And we haven't set up any outside company to collect information about your activity over time and across other websites through this site.

We honor both signals anyway: if your browser sends a DNT or GPC signal, the site doesn't load Vercel Web Analytics, and your visit isn't counted. Everything else on the site works the same.`
    },
    {
      id: 'data-retention',
      title: 'HOW LONG WE KEEP INFORMATION',
      content: `EMAILS: We keep emails for as long as they're useful for our conversation and any work we do together, and as needed for business, tax or legal records. There's no automatic deletion. If you ask us to delete your emails, we will, unless the law requires us to keep them.

ANALYTICS: Vercel discards the temporary visitor code after 24 hours. Vercel keeps the totals for at least our plan's reporting period and may keep them longer under its own policies. Our saved daily summaries hold totals only, and we keep them for as long as they're useful.

TECHNICAL LOGS: Vercel and Cloudflare keep their own server and security logs, generally for limited periods, under their own policies.`
    },
    {
      id: 'data-security',
      title: 'SECURITY',
      content: `The whole site is served over an encrypted (HTTPS) connection. We collect as little as we can, use established providers, and protect our private tools with strong sign-in.

Still, no website or email system is perfectly secure. Please don't email us sensitive information such as passwords, ID numbers or financial account details.

If a security breach ever affects your personal information, we'll notify you as required by law, including the Illinois Personal Information Protection Act.`
    },
    {
      id: 'biometrics',
      title: 'BIOMETRIC INFORMATION (ILLINOIS)',
      content: `We don't collect, capture, store or use biometric identifiers or biometric information, as those terms are defined in the Illinois Biometric Information Privacy Act (740 ILCS 14). That includes fingerprints, face geometry, voiceprints and retina or iris scans. Nothing on this site asks for them.

Imanol's private sign-in may use a passkey unlocked with Face ID, Touch ID or a similar feature. That check happens entirely on his own device. The site receives only a cryptographic confirmation, never a fingerprint or face scan. Visitors are never asked to sign in.

The photos and videos on this site are creative work. We don't run facial recognition on them or use them to identify anyone. If you appear in our work and have a question about it, contact us.`
    },
    {
      id: 'children',
      title: 'CHILDREN\'S PRIVACY',
      content: `This site is for adults and businesses looking for videography and photography. It isn't directed to children under 13, and we don't knowingly collect personal information from them. If you believe a child under 13 has sent us personal information, contact us and we'll delete it.`
    },
    {
      id: 'your-rights',
      title: 'YOUR CHOICES AND RIGHTS',
      content: `Wherever you live, you can ask us to:
• tell you what personal information we have about you, and give you a copy
• correct it
• delete it
• stop using it for a particular purpose

HOW TO ASK:
Email us using the address on the Contact page and tell us what you'd like. We may ask you to confirm the request is yours, for example by replying from the email address involved. We'll answer within one month, and we won't treat you differently for asking. If we can't fully meet a request, for example because the law requires us to keep a record, we'll tell you why.

A note on analytics: because Vercel Web Analytics doesn't identify individuals, we usually can't find or delete analytics data about one specific person.

CALIFORNIA RESIDENTS:
We don't sell or share personal information, as California law defines those terms. We don't disclose personal information to other companies for their own direct marketing.

EU AND UK VISITORS:
The legal bases we rely on are:
• Our legitimate interests: running a secure, working site, protecting it from bots and abuse, and understanding in total how it's used, in ways that have minimal impact on your privacy.
• Steps you ask us to take before working together, and our legitimate interest in answering messages: when we reply to your emails.
• Legal obligations: when the law requires us to keep or disclose information.

You also have the right to restrict our use of your information, to object to uses based on our legitimate interests, to data portability, and to complain to your local data protection authority (in the UK, the Information Commissioner's Office). We don't make decisions about you based solely on automated processing.

We're based in the United States, and our providers process information in the U.S. and other countries. Where the law requires, they use recognized safeguards for international transfers, such as the EU–U.S. Data Privacy Framework (and its UK Extension) or Standard Contractual Clauses.`
    },
    {
      id: 'other-sites',
      title: 'LINKS TO OTHER SITES',
      content: `The site links to other sites, such as Instagram. We don't embed social media posts or widgets, so nothing loads from those sites unless you click a link. Once you're on another site, its privacy policy applies.`
    },
    {
      id: 'changes',
      title: 'CHANGES TO THIS POLICY',
      content: `We'll update this policy when our practices or the law change, and we'll change the "Last Updated" date at the top of this page. If we make a significant change, such as starting to collect a new kind of personal information, we'll make that clear on this page when the change takes effect.`
    },
    {
      id: 'contact',
      title: 'CONTACT US',
      content: `For questions or requests about this policy or your information, please use the Contact page on this site. It uses a few verification steps before showing our work email address.

We don't publish a plain email address on this policy page, to limit automated harvesting.

BUSINESS OWNER: IMANOL VILLAGOMEZ
LOCATION: Aurora, Illinois, United States

We'll respond as promptly as we can, and always within the time the law requires.`
    }
  ];


  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="min-h-screen bg-zinc-darkest text-white relative -mt-12 md:-mt-14">
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
              Last Updated: {LAST_UPDATED}
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

