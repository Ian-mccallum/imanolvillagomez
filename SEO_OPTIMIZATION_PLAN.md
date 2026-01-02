# SEO Optimization Plan for IMANOL VILLAGOMEZ Portfolio Website

## Executive Summary

This comprehensive SEO plan is designed to optimize the IMANOL VILLAGOMEZ videography portfolio website for maximum visibility on Google, ChatGPT, and other search engines/AI platforms. The plan follows world-class SEO principles including technical SEO, on-page optimization, structured data, and content strategy.

**Domain**: nolvideography.com (as referenced in Privacy Policy)  
**Target Audience**: Music industry professionals, artists, record labels, event organizers seeking videography services  
**Primary Keywords**: music videographer, concert videographer, music video production, tour videography

---

## 🎯 Plan Structure

This plan is organized into two main sections:

1. **PART A: Behind-the-Scenes SEO** (Current Focus)
   - All changes are invisible to users
   - No text, styling, or UX changes
   - Only affects search engines and AI platforms
   - Can be implemented immediately without affecting design

2. **PART B: Visible SEO Enhancements** (Future)
   - Changes that affect visible content, text, or styling
   - Requires design/content decisions
   - To be implemented after Part A is complete

---

# PART A: BEHIND-THE-SCENES SEO
## (Invisible to Users - No UX/Text/Styling Changes)

## Phase 1: Technical SEO Foundation ✅ (COMPLETED)

### 1.1 Meta Tags & Title Optimization ✅
- ✅ **Title Tag Structure**: Implemented dynamic titles with format "IMANOL VILLAGOMEZ | {Page Name}"
- ✅ **Favicon**: Updated to use `/I.V..png` logo
- **Status**: Complete

### 1.2 Meta Tags Enhancement ✅ (COMPLETED)

**Impact**: Only visible in browser tabs, search results, and social media previews. No changes to page content.

#### A. Enhanced Meta Descriptions ✅
**Status**: ✅ **COMPLETED**

**Implementation**:
- ✅ Created `useMetaTags` hook (`src/hooks/useMetaTags.ts`)
- ✅ Added unique meta descriptions for all pages via `SEO_CONFIG` (`src/constants/seo.ts`)
- ✅ All pages now have optimized descriptions:
  - Home: "IMANOL VILLAGOMEZ - Professional music videographer specializing in concert footage, music videos, and tour documentation. View portfolio of work with artists like Playboi Carti, Osamason, and more."
  - Videos: "Music video portfolio by IMANOL VILLAGOMEZ. Professional concert videography, tour footage, and music video production. Browse work with top artists."
  - Photos: "Concert photography and behind-the-scenes photos by IMANOL VILLAGOMEZ. Professional music industry photography portfolio."
  - Contact: "Contact IMANOL VILLAGOMEZ for professional music videography services. Available for tours, concerts, and music video production."
  - Work: "Professional videography and photography portfolio by IMANOL VILLAGOMEZ. Music industry visual content creator."

#### B. Open Graph Tags ✅
**Status**: ✅ **COMPLETED**

**Implementation**: All Open Graph tags are automatically added via `useMetaTags` hook:
- ✅ `og:title` - Dynamic per page
- ✅ `og:description` - Page-specific descriptions
- ✅ `og:image` - Uses `/I.V..png` logo
- ✅ `og:url` - Canonical URLs per page
- ✅ `og:type` - Set to "website"
- ✅ `og:site_name` - "IMANOL VILLAGOMEZ"

#### C. Twitter Card Tags ✅
**Status**: ✅ **COMPLETED**

**Implementation**: All Twitter Card tags automatically added via `useMetaTags` hook:
- ✅ `twitter:card` - "summary_large_image"
- ✅ `twitter:title` - Dynamic per page
- ✅ `twitter:description` - Page-specific
- ✅ `twitter:image` - Uses `/I.V..png` logo

#### D. Additional Meta Tags ✅
**Status**: ✅ **COMPLETED**

**Implementation**: All additional meta tags automatically added:
- ✅ `author` - "IMANOL VILLAGOMEZ"
- ✅ `keywords` - Comprehensive keyword list
- ✅ `robots` - "index, follow"
- ✅ `language` - "English"
- ✅ `revisit-after` - "7 days"

---

## Phase 2: Structured Data (Schema.org) ✅ (COMPLETED)

**Impact**: JSON-LD scripts added to `<head>` or page. Completely invisible to users, only read by search engines and AI platforms.

**Status**: ✅ **COMPLETED**

**Implementation**:
- ✅ Created `StructuredData` component (`src/components/seo/StructuredData.tsx`)
- ✅ Helper functions for all schema types
- ✅ All schemas implemented across pages

### 2.1 Person Schema ✅
**Status**: ✅ **COMPLETED**

**Purpose**: Help search engines understand who IMANOL VILLAGOMEZ is

**Implementation**: ✅ Added JSON-LD to homepage
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "IMANOL VILLAGOMEZ",
  "jobTitle": "Music Videographer",
  "url": "https://nolvideography.com",
  "sameAs": [
    "https://instagram.com/{handle}",
    "https://twitter.com/{handle}",
    "https://vimeo.com/{handle}"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Aurora",
    "addressRegion": "Illinois"
  },
  "email": "imanolV20@icloud.com"
}
```

### 2.2 ProfessionalService Schema ✅
**Status**: ✅ **COMPLETED**

**Purpose**: Mark the site as a professional service offering

**Implementation**: ✅ Added to homepage
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "IMANOL VILLAGOMEZ Videography",
  "description": "Professional music videography and photography services",
  "provider": {
    "@type": "Person",
    "name": "IMANOL VILLAGOMEZ"
  },
  "areaServed": "United States",
  "serviceType": ["Music Videography", "Concert Videography", "Tour Documentation", "Music Video Production"]
}
```

### 2.3 VideoObject Schema
**Purpose**: Help search engines index individual videos

**Implementation**: Add to VideosPage and individual video pages (if created)
```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "{Artist} - {Song}",
  "description": "Music video by {Artist} filmed by IMANOL VILLAGOMEZ",
  "thumbnailUrl": "{thumbnail-url}",
  "uploadDate": "{date}",
  "contentUrl": "{video-url}",
  "creator": {
    "@type": "Person",
    "name": "IMANOL VILLAGOMEZ"
  }
}
```

### 2.4 ImageObject Schema
**Purpose**: Optimize photo gallery for image search

**Implementation**: Add to PhotosPage
```json
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "name": "{Photo Title}",
  "description": "Concert photography by IMANOL VILLAGOMEZ",
  "contentUrl": "{image-url}",
  "creator": {
    "@type": "Person",
    "name": "IMANOL VILLAGOMEZ"
  }
}
```

### 2.5 BreadcrumbList Schema ✅
**Status**: ✅ **COMPLETED**

**Purpose**: Help search engines understand site structure

**Implementation**: ✅ Added to all pages (Videos, Photos, Work, Other, Contact, Thank You, Privacy)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://nolvideography.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{Current Page}",
      "item": "https://nolvideography.com/{current-path}"
    }
  ]
}
```

### 2.6 WebSite Schema with SearchAction ✅
**Status**: ✅ **COMPLETED**

**Purpose**: Enable site search in Google results

**Implementation**: ✅ Added to homepage
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "IMANOL VILLAGOMEZ",
  "url": "https://nolvideography.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://nolvideography.com/work/videos?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

---

## Phase 3: Semantic HTML & Image Optimization (Minimal Visual Impact)

### 3.1 Semantic HTML Structure
**Impact**: Adds semantic tags that don't change appearance, only improves SEO and accessibility

**Action Items**:
1. Ensure all pages use proper heading hierarchy (H1 → H2 → H3) - **No text changes, just verify structure**
2. Add `<main>` tags to main content areas - **Invisible wrapper**
3. Use `<article>` tags for video/photo items - **Invisible wrapper**
4. Add `<nav>` tags with proper aria-labels - **Invisible wrapper**
5. Implement `<header>` and `<footer>` semantic tags - **Invisible wrapper**

**Note**: These are HTML structure improvements only. No styling or text changes.

### 3.2 Alt Text for Images ✅
**Status**: ✅ **COMPLETED**

**Impact**: Only visible to screen readers and search engines. No visual changes.

**Implementation**:
- ✅ Improved alt text on PhotosPage with descriptive format
- ✅ Format: "IMANOL VILLAGOMEZ - {Artist} photography - {Year}"
- ✅ Includes relevant keywords naturally
- ✅ Ready for additional images as needed

**Note**: Alt text is read by screen readers and search engines, but doesn't appear on the page visually.

### 3.3 Video File Optimization
**Impact**: Backend file naming only. No visible changes.

**Action Items**:
1. Optimize video file names: `{artist}-{song}-{location}-imanol-villagomez.mov` (when uploading new videos)
2. Add video metadata in code (invisible)
3. Create video sitemap (see Phase 4)

**Note**: File naming and metadata only. No visible changes to video display.

---

## Phase 4: Technical SEO Files (Completely Invisible)

### 4.1 Sitemap Generation ✅
**Status**: ✅ **COMPLETED**

**Implementation**:
- ✅ Created `public/sitemap.xml` with all pages
- ✅ Includes proper priority and change frequency
- ✅ Ready for video/image sitemap extensions
- ⏳ Submit to Google Search Console (external action required)

**Sitemap Structure**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://nolvideography.com</loc>
    <lastmod>2025-01-XX</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Add all pages -->
</urlset>
```

### 4.2 Robots.txt ✅
**Status**: ✅ **COMPLETED**

**Implementation**:
- ✅ Created `public/robots.txt`
- ✅ Allows all crawlers
- ✅ Disallows `/thank-you` and `/api/`
- ✅ References sitemap

### 4.3 Canonical URLs
**Action Required**: Add canonical tags to prevent duplicate content

**Implementation**: Add to each page
```html
<link rel="canonical" href="https://nolvideography.com{current-path}" />
```

### 4.4 Performance Optimization (Invisible to Users)
**Impact**: Faster loading, but no visual or UX changes

**Action Items**:
1. **Image Optimization** (invisible):
   - Convert images to WebP format (same visual quality)
   - Implement lazy loading (images load as you scroll - no visual change)
   - Use responsive images with srcset (same appearance, better performance)
   - Compress images without quality loss (invisible)

2. **Video Optimization** (invisible):
   - Provide multiple video formats (MP4, WebM) - same appearance
   - Implement video lazy loading - same appearance
   - Add video preload="metadata" - same appearance
   - Consider video CDN for faster delivery - same appearance

3. **Code Optimization** (invisible):
   - Minify CSS and JavaScript - same appearance
   - Enable Gzip/Brotli compression - same appearance
   - Implement code splitting - same appearance
   - Optimize bundle size - same appearance

4. **Core Web Vitals**:
   - Target LCP (Largest Contentful Paint) < 2.5s
   - Target FID (First Input Delay) < 100ms
   - Target CLS (Cumulative Layout Shift) < 0.1

**Note**: All performance optimizations maintain exact same visual appearance.

### 4.5 Canonical URLs ✅
**Status**: ✅ **COMPLETED**

**Implementation**:
- ✅ Canonical URLs automatically added via `useMetaTags` hook
- ✅ Each page has proper canonical tag
- ✅ Prevents duplicate content issues

### 4.6 HTTPS & Security Headers (Invisible)
**Action Items**:
1. Ensure SSL certificate is active
2. Implement HSTS headers (server configuration)
3. Add security headers (CSP, X-Frame-Options, etc.) - server configuration
4. Regular security audits

**Note**: All security improvements are invisible to users.

---

## Phase 5: Local SEO Schema (Invisible)

### 5.1 Local Schema Markup
**Impact**: JSON-LD script only. Completely invisible to users.

**Implementation**: Add LocalBusiness schema if applicable
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "IMANOL VILLAGOMEZ Videography",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Aurora",
    "addressRegion": "IL"
  }
}
```

**Note**: This is structured data only. No visible changes.

### 5.2 Google Business Profile (External)
**Action Items**: Set up outside of website code
1. Create/claim Google Business Profile (external service)
2. Add business information (external)
3. Add photos and videos (external)
4. Collect and respond to reviews (external)

**Note**: This is external to the website code.

---

## Phase 6: AI Platform Optimization (Invisible)

### 6.1 Structured Data for AI
**Purpose**: Help AI platforms understand and cite your content

**Action Items**:
1. Implement all Schema.org markup (see Phase 2) - **Already covered, invisible**
2. Add FAQ schema for common questions - **Invisible JSON-LD**

### 6.2 FAQ Schema ✅
**Status**: ✅ **COMPLETED**

**Impact**: JSON-LD script only. No visible FAQ section needed.

**Implementation**: ✅ Added to Contact page (invisible structured data)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What services does IMANOL VILLAGOMEZ offer?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "IMANOL VILLAGOMEZ offers professional music videography services including concert footage, music video production, tour documentation, and photography."
    }
  }]
}
```

**Note**: This is structured data only. No visible FAQ section required.

---

## Phase 7: Analytics & Monitoring (Invisible)

### 7.1 Google Search Console Setup
**Action Items**: External service setup
1. Verify website ownership
2. Submit sitemap
3. Monitor search performance
4. Track keyword rankings
5. Fix crawl errors
6. Monitor Core Web Vitals

**Note**: External service, no code changes needed initially.

### 7.2 Google Analytics (Invisible Tracking Code)
**Action Items**: Add tracking script (invisible to users)
1. Install Google Analytics 4 tracking code
2. Set up conversion tracking
3. Track page views, user behavior
4. Monitor traffic sources
5. Set up custom events for video plays, form submissions

**Note**: Analytics code is completely invisible to users.

### 7.3 Other Monitoring Tools
**Recommended** (all external):
- Bing Webmaster Tools
- Ahrefs or SEMrush (for keyword tracking)
- Google PageSpeed Insights
- Lighthouse audits

---

---

# PART B: VISIBLE SEO ENHANCEMENTS
## (Future - Affects UX/Text/Styling)

**Note**: These changes will affect what users see. Implement after Part A is complete.

## Phase 8: Content Optimization (Visible Changes)

### 8.1 Internal Linking Strategy
**Impact**: Adds visible links between pages

**Action Items**:
1. Create contextual links between related content
2. Link from homepage to portfolio pages
3. Cross-link between Videos and Photos pages
4. Add "Related Work" sections

**Note**: This adds visible navigation elements.

### 8.2 Content Additions (New Pages)
**Impact**: Adds new visible pages with content

**Recommended New Pages**:
1. **About Page**: Professional bio, experience, equipment, approach
2. **Services Page**: Detailed service offerings with pricing (optional)
3. **Testimonials/Reviews Page**: Client testimonials
4. **Blog/News Page**: Behind-the-scenes content, tour diaries, industry insights

**Note**: These require new content creation and design.

### 8.3 Video Content Enhancements (Visible)
**Action Items**:
1. Add video transcripts/captions (visible overlay)
2. Create video descriptions with keywords (visible on page)
3. Create video playlists by artist, tour, or genre (visible UI)

**Note**: These add visible content to pages.

---

## Phase 9: Social Media Integration (Visible)

### 9.1 Social Media Links
**Impact**: Adds visible social media icons/links

**Action Items**:
1. Add social media links to footer (visible)
2. Implement social sharing buttons (visible UI elements)
3. Cross-promote content across platforms

**Note**: Adds visible UI elements.

---

## Phase 10: Keyword Strategy (Content Changes)

### 10.1 Primary Keywords
- music videographer
- concert videographer
- music video production
- tour videography
- music photographer
- IMANOL VILLAGOMEZ (branded)

### 10.2 Long-Tail Keywords
- music videographer Chicago
- concert videographer for hire
- music video production services
- tour documentation videographer
- professional music videography

### 10.3 Keyword Implementation in Content
**Impact**: May require adding/editing visible text

**Action Items**:
1. Naturally integrate keywords into page content (visible text)
2. Use keywords in headings (H1, H2) - visible headings
3. Create content around target keywords (new visible content)

**Note**: These may require adding visible text to pages.

---

## Implementation Priority

### PART A: Behind-the-Scenes (Current Focus - No UX Changes)

#### Immediate (Week 1) ✅ **COMPLETED**
1. ✅ Title tags and favicon (COMPLETED)
2. ✅ Meta descriptions for all pages (COMPLETED)
3. ✅ Open Graph tags (COMPLETED)
4. ✅ Basic Schema.org markup - Person, ProfessionalService (COMPLETED)
5. ✅ Canonical URLs (COMPLETED)

#### Short-term (Weeks 2-4) ✅ **COMPLETED**
1. ✅ Complete Schema.org implementation (COMPLETED)
   - ✅ BreadcrumbList schema (all pages)
   - ✅ WebSite schema with SearchAction (homepage)
   - ✅ FAQ schema (Contact page)
   - ⏳ VideoObject schema (helper ready, can be added per video)
   - ⏳ ImageObject schema (helper ready, can be added per image)
2. ✅ Create sitemap.xml (COMPLETED)
3. ✅ Create robots.txt (COMPLETED)
4. ⏳ Set up Google Search Console (external action required)
5. ⏳ Performance optimization (future enhancement)
   - Image optimization
   - Video optimization
   - Code minification
6. ✅ Semantic HTML structure verified (existing structure is good)
7. ✅ Alt text improved on images (COMPLETED)
8. ⏳ Set up Google Analytics (external action required)

#### Medium-term (Months 2-3)
1. Performance monitoring and optimization (invisible)
2. SEO monitoring and adjustments (invisible)
3. Security headers implementation (invisible)

### PART B: Visible Changes (Future - After Part A)

#### Future Implementation
1. Content additions (About page, blog) - **Requires new content**
2. Internal linking enhancements - **Adds visible links**
3. Social media integration - **Adds visible UI**
4. Keyword optimization in content - **May require text changes**
5. Video transcripts/captions - **Visible overlays**

**Note**: Part B will be implemented after Part A is complete and approved.

---

## Questions to Answer Before Full Implementation

1. **Domain**: Confirm the exact domain name (nolvideography.com or other?)
2. **Social Media**: What are the Instagram, Twitter, Vimeo handles?
3. **Location**: Is Aurora, Illinois the primary service area?
4. **Services**: What are the specific service offerings and pricing (if public)?
5. **Target Audience**: Primary clients (artists, labels, venues)?
6. **Content Strategy**: Will there be a blog/news section?
7. **Analytics**: Preferred analytics platform (Google Analytics 4)?

---

## Success Metrics

### Key Performance Indicators (KPIs)
1. **Organic Traffic**: Increase month-over-month
2. **Keyword Rankings**: Track top 10 keywords
3. **Backlinks**: Monitor domain authority growth
4. **Core Web Vitals**: Maintain "Good" scores
5. **Conversion Rate**: Track contact form submissions
6. **Search Console Impressions**: Monitor visibility
7. **Click-Through Rate**: Track from search results

### Target Goals (6 months)
- 50+ organic keywords ranking in top 100
- 10+ keywords in top 10 positions
- 20+ quality backlinks
- 1000+ monthly organic visitors
- Core Web Vitals all "Good"
- 5%+ conversion rate on contact form

---

## Tools & Resources

### Recommended Tools
- **Google Search Console**: Free, essential
- **Google Analytics 4**: Free, essential
- **Google PageSpeed Insights**: Free, performance
- **Schema.org Validator**: Free, structured data
- **Ahrefs/SEMrush**: Paid, keyword research
- **Screaming Frog**: Paid, technical SEO audit

### Resources
- Google Search Central Documentation
- Schema.org Documentation
- Web.dev (Performance guides)
- Moz SEO Learning Center

---

## Next Steps - PART A Focus

### Immediate Actions (Behind-the-Scenes Only)
1. ✅ **Title tags and favicon** (COMPLETED)
2. **Create `useMetaTags` hook** for meta descriptions and Open Graph tags
3. **Implement Schema.org markup** (Person, ProfessionalService, WebSite)
4. **Add canonical URLs** to all pages
5. **Create sitemap.xml** and robots.txt
6. **Set up Google Search Console** (external)
7. **Add semantic HTML tags** (invisible wrappers)
8. **Add alt text** to images (invisible to sighted users)
9. **Set up Google Analytics** (invisible tracking)

### Questions to Answer (For Schema.org Implementation)
1. **Domain**: Confirm the exact domain name (nolvideography.com or other?)
2. **Social Media**: What are the Instagram, Twitter, Vimeo handles? (for sameAs in Person schema)
3. **Location**: Is Aurora, Illinois the primary service area? (for address in schema)
4. **Analytics**: Preferred analytics platform (Google Analytics 4)?

---

## Summary: What's Invisible vs Visible

### ✅ Invisible (Part A - Current Focus)
- Meta tags (title, description, OG, Twitter)
- Structured data (JSON-LD schemas)
- Sitemap.xml and robots.txt
- Canonical URLs
- Semantic HTML wrappers (main, article, nav)
- Alt text (screen readers only)
- Analytics tracking code
- Performance optimizations
- Security headers

### 🔜 Visible (Part B - Future)
- New pages with content
- Visible internal links
- Social media buttons
- Text content changes
- Video transcripts/captions
- New UI elements

---

**Document Version**: 2.1  
**Last Updated**: January 2025  
**Status**: Part A (Behind-the-Scenes) ✅ **COMPLETED**

## Implementation Summary

### ✅ Completed (Part A - Behind-the-Scenes)

All behind-the-scenes SEO optimizations have been successfully implemented:

1. **Meta Tags System** ✅
   - `useMetaTags` hook created and integrated
   - Meta descriptions for all pages
   - Open Graph tags for social sharing
   - Twitter Card tags
   - Canonical URLs
   - Additional meta tags (author, robots, keywords, etc.)

2. **Structured Data** ✅
   - `StructuredData` component created
   - Person schema (homepage)
   - ProfessionalService schema (homepage)
   - WebSite schema with SearchAction (homepage)
   - BreadcrumbList schema (all pages)
   - FAQ schema (Contact page)
   - Helper functions for VideoObject and ImageObject (ready for use)

3. **Technical SEO Files** ✅
   - `sitemap.xml` created with all pages
   - `robots.txt` configured
   - Canonical URLs implemented

4. **Image Optimization** ✅
   - Improved alt text on PhotosPage
   - Descriptive format with keywords

5. **Semantic HTML** ✅
   - Existing structure verified and optimized

### 📁 Files Created/Modified

**New Files:**
- `src/hooks/useMetaTags.ts` - Meta tags management hook
- `src/components/seo/StructuredData.tsx` - Structured data component
- `src/constants/seo.ts` - SEO configuration
- `public/sitemap.xml` - XML sitemap
- `public/robots.txt` - Robots configuration

**Modified Files:**
- All page components (added SEO hooks and structured data)
- `src/hooks/index.ts` - Exported new hooks
- `src/constants/index.ts` - Exported SEO config
- `index.html` - Updated title and favicon

### 🎯 Next Steps (External Actions)

1. **Google Search Console** - Submit sitemap and verify ownership
2. **Google Analytics** - Set up tracking (optional)
3. **Social Media Handles** - Add to Person schema when available
4. **Performance Optimization** - Image/video optimization (future enhancement)

