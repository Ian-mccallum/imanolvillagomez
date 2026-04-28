# NOL Videography Website

A production-ready React + TypeScript website for a music videographer, built with modern tools and best practices.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **ESLint + Prettier** - Code quality and formatting

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable components
│   ├── layout/     # Layout components (Header, Footer, Layout)
│   ├── ui/         # UI components (Button, Input, etc.)
│   └── error/      # Error handling components
├── constants/       # App constants and configuration
├── contexts/        # React Context providers (if needed)
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API services and external integrations
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Environment Variables

Copy the example env file and set values (secrets never go in git):

```bash
cp .env.example .env
```

See **`.env.example`** for **`VITE_R2_PUBLIC_URL`** (public URL for video assets) vs **`R2_*`** variables (upload script only).

## Portfolio media — adding new videos & photos

**Authoritative playbook (atomic steps, AI-friendly):**

- **[documentation/upload-new-work.md](documentation/upload-new-work.md)**

Summary:

1. Portfolio video files are hosted on **Cloudflare R2** (`videos/<filename>.mp4`); the app resolves URLs via **`VITE_R2_PUBLIC_URL`**.
2. Almost all **`public/videos/*.mp4`** are **gitignored** (see `.gitignore`); only **`osamasonpreview.mp4`** may be tracked for local homepage fallback — do **not** commit bulk MP4s.
3. After editing **`src/constants/videos.ts`** and placing files under **`public/videos/`**, run **`scripts/upload-to-r2.js`** (selective uploads recommended via **`newWork/upload-batch.txt`**).
4. **`HEVC / H.265`** exports often fail in Chrome/Firefox; re-encode with **`scripts/reencode-hevc-to-h264-web.sh`** before uploading.
5. Stills live under **`public/images/`**; register them in **`src/constants/photos.ts`** (or linked JSON — see playbook).

One-time Cloudflare setup (bucket, custom domain, CORS): **[CLOUDFLARE_R2_SETUP.md](CLOUDFLARE_R2_SETUP.md)** · Script catalog: **[scripts/README.md](scripts/README.md)**.

## Features

- ✅ TypeScript strict mode
- ✅ Path aliases for clean imports
- ✅ Error boundary for error handling
- ✅ Responsive layout structure
- ✅ SEO-friendly routing
- ✅ Code quality tools (ESLint, Prettier)
- ✅ Production-ready build configuration
- ✅ Video portfolio gallery with fullscreen modal
- ✅ Contact form with FormSubmit integration and CAPTCHA
- ✅ Thank you page after form submission
- ✅ Scroll-to-top on route changes
- ✅ Custom video rotation support (270° for portrait videos)
- ✅ Animation libraries (Framer Motion)
- ✅ Image gallery with fullscreen viewer

## SEO Features

- ✅ Dynamic page titles with `usePageTitle` hook
- ✅ Comprehensive meta tags (descriptions, Open Graph, Twitter Cards)
- ✅ Structured data (Schema.org) - Person, ProfessionalService, Breadcrumbs, FAQ
- ✅ Canonical URLs for all pages
- ✅ XML sitemap (`/sitemap.xml`)
- ✅ Robots.txt configuration
- ✅ Optimized alt text for images
- ✅ Semantic HTML structure

## Contact Form

The contact form is fully functional with:
- FormSubmit integration for email delivery
- CAPTCHA protection against bots
- Email: `imanolV20@icloud.com`
- Thank you page with navigation options
