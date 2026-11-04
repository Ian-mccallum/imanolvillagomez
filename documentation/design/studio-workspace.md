# NOL Studio workspace — implemented surface brief

Scope: the authenticated operational workspace. This records current behavior; the public portfolio and a new visual identity are outside this brief. Root `DESIGN.md` owns the extracted visual tokens.

## Task and composition

Imanol adds work, supplies context, follows preparation and chooses when an approved preview goes live. The header displays actual connection/worker state. New drop, Your drops and How it works remain available when views change. The empty New drop view exposes Choose files and Choose folder beside a short three-step explanation. Selected files keep editable grouping and notes, local draft feedback and a fixed Review & send dock.

## Workflow boundaries

1. Files and folders form a draft. IndexedDB preserves files, grouping and details on the same browser/device and origin when storage succeeds; failure is shown. This is not an uploaded or synchronized draft. Recent details use localStorage and are also origin-local.
2. Review & send opens title, city, placement and instructions. Sending uploads; it does not approve publication. Upload progress asks the user to keep the tab open.
3. Your drops searches the loaded recent-drop list by title, city and file name, with All drops, Needs you, In progress and Live filters. The interface identifies the recent-40 limit; it is not an all-history archive.
4. Questions accept inline answers. Preview rows expose Open preview, Needs changes and Publish to website when a preview link exists; failure rows offer retry. Revision produces another preview requiring approval.
5. Publish to website opens an inline confirmation before the approval API call. Preserve the preview/approval gate. Practice actions remain local simulations and must be identified as practice.

## Responsive and accessibility evidence

Desktop uses a centered workspace and upload/guide columns. Mobile stacks these sections, gives search full width, places status above drop titles and wraps actions. Visible focus, semantic status/alert text, labeled search, pressed filters and a focus-managed details dialog are implemented. Reduced-motion preferences are supported through workspace CSS and MotionConfig.

Review captures: `.impeccable/review/desktop.jpg` (1280 × 700) and `.impeccable/review/mobile.jpg` (390 × 600). These are synthetic-fixture UI evidence, not real worker, upload or publish verification. Do not use the cropped `details.jpg` as a valid dialog capture. Source behavior remains authoritative when a capture is incomplete.

Sources: `src/components/art/studio.css`, `Workspace.tsx`, `Queue.tsx`, `Details.tsx`, `draft.ts`, and `src/pages/StudioPage.tsx`.
