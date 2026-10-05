# V6.4.106 — MY FLIGHT stability & runtime audit

## Root cause fixed
Two independent mechanisms were repeatedly touching the same MY FLIGHT card DOM:

1. Daily Roster compared `host.innerHTML` against freshly rendered source HTML. Airline/logo decorators add DOM nodes after render, so the next refresh always looked "different" and replaced the card tree again.
2. The canonical MY FLIGHT adapter scheduled 5 rewrite passes after opening a manager/cargo list and 4 additional retries after `applyRoleUI`.

This created visible card/header blinking and unnecessary layout/paint work.

### Fix
- Compare against a private source snapshot (`host.__v1199SourceHtml`) rather than decorated DOM.
- Keep the all-flight list DOM when source HTML is unchanged (`host.__sagsSourceHtml`).
- Reuse the existing list shell instead of rebuilding `#fwcBody` on redundant refreshes.
- Replace 5-pass canonicalization with one animation-frame pass plus one conditional fallback.
- Replace 4-pass role UI retries with one immediate sync plus one conditional fallback.
- Scope the MY FLIGHT mutation observer to the modal once mounted.

## Option 2 form summary
Form summaries are now one compact horizontal chip row on mobile and desktop. Each chip carries:
- exact form name,
- assigned/responsible user,
- current status.

The row scrolls horizontally only when a flight has more forms than can fit, keeping the flight card short.

## Runtime audit
- Local JS files referenced by `index.html`: **58**
- Local JS bytes referenced by `index.html`: **2,647,714 bytes**
- Duplicate loaded JS blobs: **0**
- Duplicate local script/style references in `index.html`: **0**
- Missing local runtime references: **0**
- Largest loaded JS remains legacy business logic (`boot/05-legacy.js`, `boot/06-legacy.js`, `generated/core-flight.js`). They are still referenced and must not be deleted by size alone.
- Firebase Firestore is actively referenced by account/permission/legacy modules.
- Firebase Functions is actively referenced by `app/generated/boot-group-5.js` (`httpsCallable`), so its SDK is not redundant.
- Large form/PDF backgrounds are not part of the service-worker bootstrap; they stay on-demand.
- 27 local airline logos total roughly 111 KB and remain bootstrap-cached as requested.

## Additional rendering improvement
`content-visibility:auto` remains enabled for long lists, but the intrinsic card size was raised from 88px to 240px to reduce scroll jumps/layout shifts when off-screen cards become visible.
