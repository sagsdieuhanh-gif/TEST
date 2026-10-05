# V6.4.106 — Mobile navy and runtime optimization

The supplied My Flight image defines the mobile visual system. Login, navigation, work menu, My Flight, dialogs and mobile action chrome use the same navy/blue palette. Printed form layouts are preserved.

## Maintenance

- Edit visual rules in `app/styles/mobile-navy-v64106.css`.
- `app/generated/ui-build-sources.json` records each bundle's ordered inputs. Run `npm run build:ui`, then `npm run release:assets` after changing a bundle source or release metadata.
- `npm run check:ui` catches stale generated UI assets. This avoids applying source updates while leaving deployed bundles unchanged.
- Original CSS source files remain available for review; the offline shell loads the active bundles, rather than obsolete CSS/source assets.
- The text cleanup observer scans added/changed subtrees once per frame, skips script/style/input subtrees and avoids repeated whole-document scans.

## Validation

- Login, work menu, account dialog and touch targets checked at 320, 360, 390, 430 and 1280px with no page errors. Visual authentication is mocked; this does not replace live credential validation.
- Dossier browser checks pass for 6 roles at desktop/mobile widths, including delayed reads, opening, closing, reopening and unavailable-handler recovery.
- Release consistency, resource budget, PWA hash verification and failed-update rollback checks pass.
- Four existing regression failures remain: airline F54/F94 configuration differs from its test; roster statusSummary static expectations differ from the current source; an old copy test references undefined `dd`; an old read-only test cannot find `readSlimState` in its selected source. They reproduce on the original code. No airline configuration or operational record is changed to silence them.
- The existing full runtime generator also reports a pre-existing mismatch between operational source and deployed core bundles. This release preserves the deployed operational core and introduces a separate reproducible UI bundle builder; do not regenerate operational core blindly.

## Deployment

Target: TEST GitHub Pages. The Vercel connection denied access to the account scope containing the existing projects. The TEST Pages pipeline remains the available deployment path.
