---
name: NOL Studio
description: Compact publishing workspace for adding work, reviewing previews and approving publication.
colors:
  ink: '#111'
  warmgray: '#c9c8c7'
  foreground: '#dedede'
  muted: '#969696'
  divider: '#282828'
  panel: '#0d0d0d'
  upload-canvas: '#090909'
  primary: '#ef6058'
  primary-hover: '#ff7972'
  control-border: '#5b5a56'
  control-hover: '#282826'
  control-hover-border: '#a6a49e'
  placeholder: '#a5a39e'
  selected-filter: '#30302d'
  status: '#a6a6a6'
  status-failed-text: '#ef9d96'
  nav-active: '#1b1b1b'
  dock: '#151513'
typography:
  wordmark:
    fontFamily: '''Archivo Black'', sans-serif'
    fontSize: 23px
    lineHeight: 1
    letterSpacing: -0.04em
  headline:
    fontFamily: Arial, Helvetica, sans-serif
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.035em
  title:
    fontFamily: Arial, Helvetica, sans-serif
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: -0.015em
  body:
    fontFamily: Arial, Helvetica, sans-serif
    fontSize: 14px
    lineHeight: 1.5
  label:
    fontFamily: Arial, Helvetica, sans-serif
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.35
rounded:
  control: 4px
  navigation: 5px
  dock: 5px
spacing:
  action-gap: 12px
  desktop-gutter: 48px
  desktop-content-offset: 244px
  mobile-gutter: 20px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: 9px 14px
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
    textColor: '{colors.ink}'
  button-secondary:
    backgroundColor: transparent
    textColor: '{colors.warmgray}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: 9px 14px
  search:
    backgroundColor: '{colors.panel}'
    textColor: '{colors.warmgray}'
    rounded: '{rounded.control}'
    padding: 8px 10px
    width: 240px
  status:
    backgroundColor: transparent
    textColor: '{colors.status}'
    padding: '0'
    rounded: '0'
---

# Design System: NOL Studio

## Overview

This is the implemented **authenticated Studio workspace**, not the public portfolio, sign-in or onboarding identity. The small NOL wordmark retains Archivo Black. Normal-case Arial headings and drop names keep the working surface quiet and compact. There is no animated Backdrop in the authenticated workspace.

**Key Characteristics:**
- Fixed desktop side navigation and fixed mobile bottom navigation.
- One upload canvas; Help owns the tutorial.
- Unboxed status text, divided drop rows and understated inline replies.
- Red actions, visible upload choices and explicit publication approval.

Source authority is the final CSS cascade in `src/components/art/studio.css`, plus `Workspace.tsx`, `Queue.tsx`, `Details.tsx` and `src/pages/StudioPage.tsx`. The frontmatter records actual workspace primitives. Earlier declarations superseded by the appended compact-workspace section are not current design rules.

## Colors

### Primary

Warm action red marks primary upload, reply and publication controls, with dark ink text and brighter hover. The workspace focus outline uses the same red.

### Neutral

The foreground is light neutral gray; NOL and selected controls retain warm gray. Muted gray carries supporting information. Near-black fields and upload canvas sit against the dark page, with quiet dividers and visible borders. Status is unboxed text: preview/questions are brighter, failures pale red. Never rely on color alone to explain state.

## Typography

The wordmark role applies to the small NOL signature. Workspace page headings, upload labels and drop titles use Arial in normal case. Folder-name inputs and selection counts use Arial (20px), rather than Archivo display lettering. Headings reduce to (22px) on mobile; drop titles reduce to (15px). Supporting copy is commonly (13px), metadata (12–13px), and compact mobile navigation (11px).

The details dialog and inherited file-editing controls retain some existing monospace/pill styling; the file-grid override converts its monospace text to Arial. Those scoped exceptions are not a new heading or body typography direction.

## Layout

Desktop reserves a left rail for fixed navigation, with content offset and right gutter defined in frontmatter. The wordmark is fixed above the rail. Header actions align right above a divider. Navigation has three choices: New drop, Your drops, Help. Only Your drops mounts the queue.

New drop uses a single broad upload canvas, centered within a maximum width (1100px), with a page heading above and one approval reminder below. The tutorial lives in Help. Selected files replace the empty canvas with editing controls and a fixed bottom review dock.

The intermediate range (701–1000px) narrows the rail and content offset. At (700px) and below, the wordmark returns to the header and navigation becomes a fixed three-column bottom bar, minimum height (68px), respecting safe-area padding. The draft dock sits above it, with bottom offset `calc(78px + env(safe-area-inset-bottom))`. Search becomes full width at the existing (640px) field breakpoint. Mobile drop titles and statuses remain side by side; actions wrap without stretching each button to fill the row.

The details dialog is centered on desktop and bottom-aligned on mobile, with scrollable content and maximum height (92svh). Keep content clear of the fixed navigation and draft dock.

## Elevation & Depth

Rows and reply/confirmation groups remain flat. Replies and confirmations use a quiet left border, without filled cards. The upload canvas has a subtle dashed border. The dock is a bordered dark layer. Only the details dialog uses a blurred backdrop and deep shadow; exact shadow and motion values are in `.impeccable/design.json`.

## Shapes

Ordinary buttons, search, filters and upload canvas use compact control corners. Navigation and dock have slightly larger compact corners. Status labels have no badge container. The existing details dialog retains larger corners and pill controls; keep these scoped to that dialog.

## Components

**Buttons.** Compact controls have minimum height (38px), medium-weight Arial, red primary fill or a bordered secondary treatment. Primary hover brightens; secondary hover changes tone and border. Workspace focus is an outline (2px) offset (5px). Disabled buttons use opacity (0.5) and a not-allowed cursor.

**Upload canvas.** A file icon, Drop files here label, visible Choose files and Choose folder actions and file-limit text share one centered target. Dragging and keyboard shortcuts supplement visible controls.

**Navigation.** Small line icons accompany New drop, Your drops and Help. Desktop selection uses a quiet filled row; mobile selection brightens the item without a filled card. Counts are plain small text beside the destination, positioned as small annotations on mobile.

**Queue.** Search and pressed filters operate on the loaded recent-drop list. Drop names are normal case; statuses are unboxed text, with a dot for attention states. Feedback and confirmation expand inline against a left rule. Removal remains inside Drop details and requires confirmation.

**Draft editing.** Enabled file instructions, caption metadata, generic-field placeholders, folder counts, Ungroup files and Clear all use warm gray at (80% opacity). Add instructions uses (12px); Ungroup files uses (13px). Clear all retains two-tap confirmation; its armed state uses action red with dark text. These are enabled controls, not disabled metadata.

**Details.** Title, city, placement and instructions precede sending. Recent answers and Same as last are origin-local shortcuts. Focus enters the dialog, Tab stays inside, Escape closes it and focus returns. Sending does not publish.

## Do's and Don'ts

### Do:
- **Do** keep the NOL wordmark small and workspace headings in normal-case Arial.
- **Do** preserve visible file/folder actions and the separate New drop, Your drops and Help destinations.
- **Do** preserve truthful worker/drop status, revision, retry and explicit publish confirmation.
- **Do** describe drafts as device- and origin-local, with storage-failure feedback.
- **Do** keep the mobile draft dock above bottom navigation.

### Don't:
- **Don't** restore the large editorial headings, top tab bar or upload tutorial sidebar.
- **Don't** turn statuses and replies into prominent filled cards.
- **Don't** add the animated Backdrop to the authenticated workspace.
- **Don't** imply sending, retrying or requesting changes publishes work.
- **Don't** claim cross-device draft synchronization or full visual approval from incomplete captures.
