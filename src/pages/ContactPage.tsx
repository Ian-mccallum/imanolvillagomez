import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlitchText } from '@/components/ui/GlitchText';
import { GlitchOverlay } from '@/components/ui/GlitchOverlay';
import { usePageTitle, useMetaTags } from '@/hooks';
import { SEO_CONFIG, BASE_URL } from '@/constants';
import { StructuredData, createBreadcrumbSchema, createFAQSchema } from '@/components/seo/StructuredData';

/**
 * ContactPage
 * 
 * Carson: Experimental typography, break the grid, asymmetrical layouts
 * Oliver: Dark canvas, distressed textures, gothic beauty
 * West: Minimalist perfectionism, bold statements, clean aesthetics
 * Weirdcore: Glitch effects, digital artifacts, intentional glitches
 * 
 * Features:
 * - Dark background with intense grain texture
 * - Experimental form layout with asymmetrical elements
 * - Bold, minimal typography
 * - Glitch effects on form interactions
 * - White text on dark background
 * - Memorable, viral-worthy design
 */

export const ContactPage = () => {
  const seoConfig = SEO_CONFIG.contact;
  usePageTitle('Contact');
  useMetaTags({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
  });

  // Breadcrumb schema
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Contact', url: `${BASE_URL}${seoConfig.path}` },
  ]);

  // FAQ schema for AI platforms
  const faqSchema = createFAQSchema([
    {
      question: 'What services does IMANOL VILLAGOMEZ offer?',
      answer: 'IMANOL VILLAGOMEZ offers professional music videography services including concert footage, music video production, tour documentation, and photography.',
    },
    {
      question: 'How can I contact IMANOL VILLAGOMEZ?',
      answer: 'You can contact IMANOL VILLAGOMEZ through the contact form on this website or via email at imanolV20@icloud.com.',
    },
    {
      question: 'What types of events does IMANOL VILLAGOMEZ film?',
      answer: 'IMANOL VILLAGOMEZ specializes in music industry events including concerts, tours, music video production, and behind-the-scenes documentation.',
    },
  ]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = () => {
    // FormSubmit handles submission via form action
    // No need to prevent default - let form submit naturally
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <StructuredData data={[breadcrumbSchema, faqSchema]} />
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
        <div className="max-w-3xl mx-auto">
          {/* Header - Carson: Experimental typography, West: Bold minimalism */}
          <motion.div
            className="mb-12 md:mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black text-white uppercase tracking-tighter mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <GlitchText intensity="medium">CONTACT</GlitchText>
            </motion.h1>
            <motion.p
              className="text-zinc-300 text-sm md:text-base uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              LETS CREATE ART
            </motion.p>
          </motion.div>

          {/* Form - Carson: Experimental layout, Oliver: Dark beauty, West: Minimal */}
          <motion.form
            onSubmit={handleSubmit}
            action="https://formsubmit.co/imanolV20@icloud.com"
            method="POST"
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* FormSubmit hidden fields */}
            <input type="hidden" name="_captcha" value="true" />
            <input type="hidden" name="_template" value="box" />
            <input type="hidden" name="_next" value={window.location.origin + '/thank-you'} />
            <div className="space-y-6 md:space-y-8">
              {/* Name and Email - Side by side on desktop (Carson: Break the grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Name */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <label
                    htmlFor="name"
                    className="block text-xs md:text-sm font-black text-white uppercase tracking-wider mb-3"
                  >
                    NAME
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full bg-black border-2 border-white/20 text-white px-4 py-4 md:px-6 md:py-4 focus:outline-none focus:border-white transition-all duration-200 font-medium placeholder:text-zinc-500 text-base min-h-[44px]"
                      placeholder="Your name"
                    />
                    {/* Weirdcore: Glitch overlay on focus */}
                    {focusedField === 'name' && (
                      <GlitchOverlay intensity="subtle" trigger="always" />
                    )}
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <label
                    htmlFor="email"
                    className="block text-xs md:text-sm font-black text-white uppercase tracking-wider mb-3"
                  >
                    EMAIL
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full bg-black border-2 border-white/20 text-white px-4 py-4 md:px-6 md:py-4 focus:outline-none focus:border-white transition-all duration-200 font-medium placeholder:text-zinc-500 text-base min-h-[44px]"
                      placeholder="your@email.com"
                    />
                    {/* Weirdcore: Glitch overlay on focus */}
                    {focusedField === 'email' && (
                      <GlitchOverlay intensity="subtle" trigger="always" />
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Subject */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <label
                  htmlFor="subject"
                  className="block text-xs md:text-sm font-black text-white uppercase tracking-wider mb-3"
                >
                  SUBJECT
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-black border-2 border-white/20 text-white px-4 py-4 md:px-6 md:py-4 focus:outline-none focus:border-white transition-all duration-200 font-medium placeholder:text-zinc-500 text-base min-h-[44px]"
                    placeholder="Project type"
                  />
                  {/* Weirdcore: Glitch overlay on focus */}
                  {focusedField === 'subject' && (
                    <GlitchOverlay intensity="subtle" trigger="always" />
                  )}
                </div>
              </motion.div>

              {/* Message */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <label
                  htmlFor="message"
                  className="block text-xs md:text-sm font-black text-white uppercase tracking-wider mb-3"
                >
                  MESSAGE
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows={8}
                    className="w-full bg-black border-2 border-white/20 text-white px-4 py-4 md:px-6 md:py-4 focus:outline-none focus:border-white transition-all duration-200 font-medium resize-none placeholder:text-zinc-500 text-base min-h-[44px]"
                    placeholder="Tell me about your project..."
                  />
                  {/* Weirdcore: Glitch overlay on focus */}
                  {focusedField === 'message' && (
                    <GlitchOverlay intensity="subtle" trigger="always" />
                  )}
                </div>
              </motion.div>

              {/* Submit Button - West: Bold, minimal, iconic */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <motion.button
                  type="submit"
                  className="w-full md:w-auto bg-white hover:bg-white/90 text-black font-black px-8 py-4 md:px-12 md:py-6 text-base md:text-lg lg:text-xl uppercase tracking-tighter transition-colors duration-200 min-h-[44px] flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  SEND
                </motion.button>
              </motion.div>
            </div>
          </motion.form>
        </div>
      </div>
      </div>
    </>
  );
};
