# NOL Studio workspace — implemented surface brief

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
