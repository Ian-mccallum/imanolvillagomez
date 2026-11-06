# NOL Studio workspace — implemented surface brief

> **2026-11 redesign.** Visuals below describing Arial, unboxed statuses, left-rule replies and "folders" are superseded. Current tokens and components live in root `DESIGN.md`: Inter UI type, layered warm surfaces, pill statuses, card drops, floating side/bottom sheet, phone tab bar, skeleton loading. Folders are now presented as **artists** (Add artist, empty artist drop zones, Remove artist keeps files), and drops in pending, question, preview, failed or live can be deleted (live: only the list entry and originals; the website keeps the work). Workflow boundaries below still apply.

Scope: the authenticated operational workspace. This records current behavior; the public portfolio and a new visual identity are outside this brief. Root `DESIGN.md` owns the extracted visual tokens.

## Task and composition

Imanol adds work, supplies context, follows preparation and chooses when an approved preview goes live. The header displays actual connection/worker state. New drop, Your drops and Help remain available in fixed desktop side navigation or fixed mobile bottom navigation. New drop exposes one upload canvas with Choose files and Choose folder; Help owns the tutorial. The queue appears only in Your drops. The authenticated workspace has no animated Backdrop. Selected files keep editable grouping and notes, local draft feedback and a fixed Review & send dock.

## Workflow boundaries

1. Files and folders form a draft. IndexedDB preserves files, grouping and details on the same browser/device and origin when storage succeeds; failure is shown. This is not an uploaded or synchronized draft. Recent details use localStorage and are also origin-local.
2. Review & send opens title, city, placement and instructions. Sending uploads; it does not approve publication. Upload progress asks the user to keep the tab open.
3. Your drops searches the loaded recent-drop list by title, city and file name, with All drops, Needs you, In progress and Live filters. The interface identifies the recent-40 limit; it is not an all-history archive.
4. Questions accept inline answers. Preview rows expose Open preview, Needs changes and Publish to website when a preview link exists; failure rows offer retry. Revision produces another preview requiring approval.
5. Publish to website opens an inline confirmation before the approval API call. Preserve the preview/approval gate. Practice actions remain local simulations and must be identified as practice.

## Responsive and accessibility evidence

Desktop has compact side navigation, a small Archivo NOL wordmark and normal-case Arial headings/drop names. Folder-name inputs and selection counts use Arial (20px). Enabled draft instructions, caption metadata, generic-field placeholders, folder counts, Ungroup files and Clear all use warm gray at 80% opacity. Add instructions is (12px), Ungroup files (13px); armed Clear all uses action red/dark text and retains its two-tap confirmation. Mobile puts navigation at the bottom and the draft dock above it; search expands and actions wrap. Statuses are unboxed text; replies and confirmations use a left rule. Visible focus, semantic status/alert text, labeled search, pressed filters and a focus-managed details dialog are implemented. Reduced-motion preferences are supported.

Current desktop captures: `.impeccable/review/desktop-rebuilt.jpg` (1280 × 700) and `desktop-actual-rebuilt.jpg` (1268 × 713). Valid mobile captures are `mobile-rebuilt.jpg` and `mobile-draft-rebuilt.jpg`, both (390 × 713), in the same directory. `mobile-draft-final.jpg` (390 × 713) supersedes the draft capture for the corrected enabled controls; the empty mobile and desktop captures remain valid layout evidence. In the mobile draft, DOM measurements put navigation at y=645.14 and the dock bottom at y=635.14: a (10px) gap, with no horizontal overflow. The shorter (390 × 600) viewport has DOM checks only. Earlier `desktop.jpg` and `mobile.jpg` show the superseded layout; cropped `details.jpg` remains invalid dialog evidence. Independent bounded verdict: ship; both final file-control contrast and Clear-all findings were resolved. This does not establish visual approval of uncaptured queue/details states or 390 × 600. These fixture captures do not establish production upload/publication or full visual approval.

Sources: `src/components/art/studio.css`, `Workspace.tsx`, `Queue.tsx`, `Details.tsx`, `draft.ts`, and `src/pages/StudioPage.tsx`.

## Account and processing status

Idle availability lives in the account disclosure rather than a persistent “Studio is ready” banner. Processing and connection problems remain visible in the header. The native account disclosure supports Escape and outside-click dismissal; sign-out waits for draft persistence, shows pending/error feedback, and refuses to leave if an unsent draft cannot be saved. A 120ms fade replaces the shutter wipe.

Account captures: `.impeccable/review/account-desktop.jpg` (1268 × 713, closed header) and `account-mobile.jpg` (390 × 713, open panel). Escape/focus return and sign-out browser checks passed; build and touched-file lint passed. These checks do not imply whole-interface visual approval.

## Character finish

The final surface adds warm foreground/muted grays, coral upload registration corners and active-navigation accents, a stacked-sheet hover fan, sage Live and amber working/publishing status. Files & notes hides the browser marker and uses a coral plus-to-cross indicator with a (44px) summary target. Pointer and Enter toggles, the hidden marker and no overflow at (390px) were verified. Finite feedback runs (100–240ms); view fades are opacity-only (180ms), disclosure/account reveals (150ms). Reduced motion removes animations and decorative spatial transforms.

Current character captures: `.impeccable/review/character-desktop.jpg`, `character-mobile.jpg` and `character-upload-desktop.jpg` (synthetic fixtures). Independent `character_finish_review` verdict: ship, with no material findings; the minor target-size finding was corrected to (44px). The detector still reports (92) findings, mostly legacy surfaces, docs and Arial; do not claim a clean detector result or production upload/publication verification.
