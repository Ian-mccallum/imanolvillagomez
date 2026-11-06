---
name: NOL Studio
description: Private upload workspace — add work, follow previews, publish. Calm premium tool surface that stays recognisably NOL.
colors:
  bg: '#0c0c0b'
  sidebar: '#0f0f0e'
  surface: '#151514'
  surface-2: '#1c1c1a'
  surface-3: '#262623'
  line: 'rgba(242,236,228,0.07)'
  line-2: 'rgba(242,236,228,0.12)'
  line-3: 'rgba(242,236,228,0.22)'
  text: '#f0ebe4'
  text-2: '#b8b1a7'
  text-3: '#8e8880'
  accent: '#ef6058'
  accent-hover: '#f37a72'
  accent-press: '#e0524a'
  accent-ink: '#1a0b0a'
  accent-text: '#ff9a92'
  accent-soft: 'rgba(239,96,88,0.14)'
  status-live: '#becaa0'
  status-working: '#e5c58f'
  status-attention: '#f2b1a5'
  status-failed: '#ff9a91'
typography:
  ui:
    fontFamily: "'Inter', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif"
    features: "'cv11', 'ss01'; tabular-nums for counts, dates and stats"
  wordmark:
    fontFamily: "'Archivo Black', sans-serif"
    fontSize: 22px
    letterSpacing: -0.04em
  scale:
    page-title: 26px / 650 / -0.022em (22px on phones)
    card-title: 17px / 600 / -0.012em (drop detail 22px)
    stat: 36px / 650 / -0.035em (30px on phones)
    body: 14px / 400 / 1.5
    label: 13px / 550
    meta: 12-13px / text-3
    tab-label: 11px / 550 (phone tab bar)
rounded:
  xs: 6px
  sm: 8px # controls, inputs, nav items
  md: 10px # segmented control, inner panels, thumbnails
  lg: 14px # cards, notices, empty states
  xl: 18px # upload canvas, artist sections, sheet, dock
  pill: 999px # status, chips, counts
spacing:
  base: 4px
  steps: [4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48]
  sidebar: 232px (200px at 768-1023px)
  gutter: clamp(24px, 4vw, 56px) (16px on phones)
  content-max: 1120px
motion:
  fast: 120ms # hover, press
  base: 180ms # view fade, disclosure, sheet backdrop
  slow: 240ms # sheet slide, thumbnail zoom
  ease: cubic-bezier(0.22, 1, 0.36, 1)
  reduced: all animations off, decorative transforms removed
shadow:
  1: 0 1px 2px rgba(0,0,0,.35)
  2: 0 10px 28px -8px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.3)
  3: 0 28px 72px -16px rgba(0,0,0,.75), 0 4px 14px rgba(0,0,0,.35)
components:
  button: { height: 40px (44px phone), padding: 0 16px, radius: sm, weight: 550 }
  button-primary: { background: accent, text: accent-ink, hover: accent-hover }
  button-secondary: { background: surface-2, border: line-2, hover: surface-3 }
  button-ghost: { background: transparent, text: text-2, hover: rgba(255,255,255,.05) }
  button-danger: { background: rgba(255,154,145,.12), border: rgba(255,154,145,.32), text: status-failed }
  input: { height: 40px, radius: sm, border: line-2, focus: accent border + 3px accent ring }
  status-pill: { height: 26px, radius: pill, dot: 6px currentColor, tinted 12% background }
  segmented: { padding: 3px, radius: md, selected: surface-3 + shadow-1 }
  focus: 2px solid accent, offset 2px (not on dialog containers)
---

# Design System: NOL Studio

## Overview

Studio is Imanol's private workspace, mostly used one-handed on an iPhone. It should feel like a calm, premium creative tool (Linear / Apple Photos level of polish) while staying NOL: dark warm grays, one coral accent, Archivo Black only in the wordmark. The lock screen keeps its dramatic character and is not part of this system.

Source of truth: `src/components/art/studio.css` (single file, organised by surface, every selector scoped under `.studio-room`), plus markup in `Workspace.tsx`, `Queue.tsx`, `DropDetail.tsx`, `insights/Insights.tsx`, `Details.tsx`, `Tile.tsx` and `src/pages/StudioPage.tsx`.

## Typography

Inter (variable, Google Fonts `@import` inside `studio.css`, so it only loads with the lazy Studio chunk) with an Apple/system fallback. Inter was chosen over the bare system stack for identical metrics on iPhone, Mac and Windows and for its tabular figures; `-apple-system`/SF Pro is the immediate fallback, so a slow font load still looks native on Imanol's phone. Sentence case everywhere; uppercase only for small group labels in the drop detail.

## Colour

Four layered neutrals (bg → surface → surface-2 → surface-3) separated by hairline warm-white borders, not heavy fills. Coral is reserved for primary actions, active navigation, focus, selection and the first bar in a chart. Status colours always come with a text label and a dot, never colour alone. All body and meta text meets WCAG AA on every surface (text-3 is ≥4.9:1 on surface-2).

## Layout

- ≥768px: fixed left sidebar (wordmark + nav), sticky top bar with status, website link and account menu; content centred at max 1120px.
- <768px: sticky blurred top bar (wordmark + account), fixed bottom tab bar (icon + label, coral pill behind the active icon, count badges, safe-area padding). Every control is ≥44px tall.
- Drop detail is a floating side sheet (720px, 12px inset) on desktop and a 94svh bottom sheet with a grip on phones. The image/video viewer is full-screen with a floating info bar.
- The draft dock floats above content (above the tab bar on phones) as a blurred bar.

## Components

**Drop card.** Surface card, title + meta left, status pill right, thumbnail strip, explanation, actions (primary action is always the coral button), then a footer with Files & notes and View drop. Attention states get a faint coral wash and border. Replies and confirmations are inset panels; delete confirmations use the danger tone.

**Artists.** A drop can hold several artists. Each artist is a section card with order number, inline name field, file count, instructions field, ↑/↓ order controls and "Remove artist (keeps files)". Empty artists show a dashed drop zone. Files without an artist sit in a dashed "No artist yet" section. Review & send lists artists in site order.

**Insights.** Big tabular stats, delta pill (sage up / coral down), coral sparkline, bar lists with tracks; segmented range control.

**Loading.** Shimmer skeletons replace "Loading…" text for drops, the drop sheet, insights and preview tiles; each keeps a screen-reader status label.

## Do / Don't

- Do keep one coral primary per area, sentence-case copy and visible focus rings.
- Do keep explicit publish confirmation and practice-mode labelling.
- Don't use Archivo Black outside the wordmark, add the animated Backdrop to the workspace, or rely on colour alone for status.
- Don't put `backdrop-filter` or `transform` on an ancestor of the fixed wordmark, sheet or viewer (it changes their containing block).
