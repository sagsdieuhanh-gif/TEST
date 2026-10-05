# E-REPORT SAGS

Before editing UI, read `FIXED_UI_RULE.md` and `PROJECT_RULES.md`.
The approved F54 button system is mandatory across all screens and devices.
Reuse `SAGSButtonBase` and `app/styles/fixed-ui-rule-v64113.css`; new features
must not introduce another button style. Keep business handlers, permissions,
Firebase data, form/PDF/signature behavior and PWA update logic intact.

The project owner explicitly confirmed on 2026-10-04 that the existing **Ký**
action stays in the form toolbar. Do not replace it with a new notes feature.

For UI changes run `npm test`, `npm run check:ui`, and `npm run test:ui`.
Verify 360/375/390/412/430px, tablet and desktop; verify hidden actions,
safe-area clearance and print behavior. Synchronize release metadata and asset
hashes using the existing release tool when changing shipped assets.
