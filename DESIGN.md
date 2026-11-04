---
name: NOL Studio
description: NOL's operational workspace for adding work and approving website previews.
colors:
  ink: "#111"
  warmgray: "#c9c8c7"
  muted: "#aaa9a7"
  divider: "#373735"
  panel: "#111110"
  primary: "#ef6058"
  primary-hover: "#ff7972"
  control-border: "#5b5a56"
  control-hover: "#282826"
  control-hover-border: "#a6a49e"
  placeholder: "#a5a39e"
  selected-filter: "#30302d"
  status: "#292927"
  status-failed: "#462725"
  status-failed-text: "#ffb3ab"
  feedback-panel: "#1a1a18"
  dock: "#151513"
typography:
  display:
    fontFamily: "'Archivo Black', sans-serif"
    fontSize: "38px"
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "'Archivo Black', sans-serif"
    fontSize: "28px"
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Archivo Black', sans-serif"
    fontSize: "21px"
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.35
rounded:
  status: "5px"
  field: "6px"
  button: "7px"
  feedback: "8px"
  panel: "12px"
spacing:
  action-gap: "12px"
  section-gap: "24px"
  desktop-gutter: "36px"
  mobile-gutter: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.warmgray}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "10px 18px"
  search:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.warmgray}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
    width: "240px"
  status:
    backgroundColor: "{colors.status}"
    textColor: "{colors.warmgray}"
    rounded: "{rounded.status}"
    padding: "5px 9px"
---

# Design System: NOL Studio

## Overview

This captures the implemented **Studio workspace only**. It does not prescribe the public portfolio, sign-in, or onboarding identity. The existing NOL identity supplies dark ink, warm gray, Archivo Black and a red action accent; readable Arial carries the operational interface.

The workspace keeps the next task visible: add files, follow preparation, review a preview and explicitly approve publication. It uses a restrained, mostly flat interface with strong headings and plain instructions. This is an extraction of the built system, not a new visual identity proposal.

**Key Characteristics:**
- Archivo Black for NOL and major headings; Arial for routine reading and actions.
- Warm gray text, quiet dividers and red primary actions.
- Persistent navigation and visible upload choices.
- Plain-language status and explicit approval controls.

Source authority: `src/components/art/studio.css`, `Workspace.tsx`, `Queue.tsx`, `Details.tsx`, and `src/pages/StudioPage.tsx`. Tokens above are normative for the extracted workspace primitives. Modal and inherited file-grid exceptions are described below rather than presented as a unified system that does not yet exist.

## Colors

### Primary

Warm action red identifies primary upload, reply and publish controls, with dark ink text. The hover red is brighter. It also supplies the workspace keyboard focus outline.

### Neutral

Warm gray is the main foreground; muted gray supports metadata and instructions. Near-black panels, quiet dividers and visible control borders separate tasks without turning the drop list into floating cards. Preview/question badges invert to warm gray with dark text; failure badges use a dark red surface and pale red text.

**The Action Rule.** Preserve red for purposeful controls and state emphasis; use text alongside color to explain status.

## Typography

Archivo Black supplies the wordmark, upload/help heading, queue heading and uppercase drop titles. Arial, Helvetica, sans-serif is the workspace body stack. Body copy uses the frontmatter body role; buttons use its label role. Metadata and navigation support copy commonly use smaller text (13px), and status badges use compact text (12px).

Upload/help display headings reduce to (30px) on mobile, queue headings to (26px). The NOL wordmark changes from (30px) to (26px). Instructions use comfortable line lengths: upload introduction (42ch), drop explanations and help copy (70ch).

The details modal retains small monospace chips/labels and larger form text; the file-grid override converts inherited monospace text to Arial. Treat these as existing scoped exceptions, not permission to spread dense uppercase monospace through the workspace.

## Layout

The centered workspace has a maximum width of (1240px), desktop gutters from the spacing tokens and bottom clearance (120px). Header, navigation and content read vertically. The empty upload view is a main target plus a guide column (280px), with a generous gap (60px). The intermediate breakpoint (850px) reduces that column and spacing.

At the mobile breakpoint (640px), gutters narrow, the upload target and guide stack, drop headers stack with status first, search becomes full width and actions wrap. The desktop website shortcut and navigation's draft-size annotation hide; the three navigation choices remain. Navigation is persistent across views, not a sticky scroll element.

With selected files, a fixed bottom dock keeps Review & send reachable and accounts for the safe-area inset. Mobile hides its title shortcut while retaining the main action. The details dialog is centered on desktop and bottom-aligned on mobile, with scrollable content and maximum height (92svh).

## Elevation & Depth

Workspace rows and panels use tonal differences and borders without shadows. The fixed dock sits above content. The details dialog is the exception: a blurred dark backdrop and a deep shadow establish its modal layer. Exact shadow, focus, motion and breakpoint details live in `.impeccable/design.json`.

## Shapes

Use the compact radius vocabulary in frontmatter for ordinary controls, badges, feedback and upload panels. The upload target has a dashed outline. Drop rows use horizontal rules rather than separate rounded cards. The existing details modal has larger rounded corners (24px), pill controls and pill-shaped send action; keep that exception scoped to the dialog.

## Components

**Buttons.** Primary and secondary buttons share compact geometry and minimum height (44px). Secondary controls have a visible border and tonal hover; primary hover brightens the red. Workspace keyboard focus is a solid outline (2px) offset (5px). Disabled buttons use reduced opacity (0.5) and a not-allowed cursor.

**Upload target.** Keep Choose files and Choose folder visible together, plus file-limit text. Dragging and keyboard shortcuts supplement these controls. Selected files reveal the persistent draft status and bottom review dock.

**Navigation.** New drop, Your drops and How it works remain available. The active item has a light underline and brighter text. Counts distinguish files in draft from drops needing attention.

**Search, filters and rows.** Search is a bordered dark field. Selected filters use a quiet filled surface with `aria-pressed`; drop rows use named status badges and explanatory text. Feedback, answers and publish confirmation expand inline. Removal stays in Drop details and requires confirmation.

**Details dialog.** Title, city, placement and instructions precede sending. Recent answers and Same as last are local shortcuts. Focus enters the dialog, Tab is contained, Escape closes it and focus returns to the previous control. Sending the drop does not publish it.

## Do's and Don'ts

### Do:
- **Do** preserve the NOL identity while using readable workspace body text.
- **Do** keep visible file/folder actions, navigation and a reachable review action.
- **Do** pair worker/drop state with truthful words and a relevant next action.
- **Do** preserve preview review, revision and explicit publish confirmation.
- **Do** describe drafts as saved on this device and origin, with storage-failure feedback.

### Don't:
- **Don't** apply this workspace extraction as a redesign of the public portfolio.
- **Don't** imply that sending, retrying or requesting changes publishes work.
- **Don't** present local drafts or local recent answers as cross-device synchronization.
- **Don't** replace live connection/worker state with an always-ready decorative indicator.
- **Don't** treat fixture screenshots as evidence of a production upload or publication.
