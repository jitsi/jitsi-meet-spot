# Pending migration work

The TypeScript / npm-workspaces / Node 24 / ESM migration is complete and green
(`npm run lint` / `typecheck` / `test` (269 tests) / `build` all pass at the root).
This file tracks what was **deliberately deferred** and why, plus follow-ups
surfaced along the way.

`spot-prosody` (Lua) is intentionally **out of scope** for all of the below.

---

## 1. Held dependency upgrades

These are pinned to their latest **React-17-compatible** versions because React 17
and React Native 0.68 majors are held (React 17 keeps the enzyme test suite working).
Bumping them is a project of its own.

| Dependency | Current (held) | Target | Blocker / work required |
|---|---|---|---|
| `react` / `react-dom` | 17.0.2 | 19.x | Enzyme has **no adapter past React 17**. Requires migrating spot-client's component tests off `enzyme` (→ React Testing Library) before/with the bump. Unblocks everything below. |
| `react-native` | 0.68.5 | 0.8x | Large native iOS/Android upgrade (Gradle, CocoaPods, AndroidX, new architecture). Needs Xcode + Android SDK to verify; couples with the React 18 bump. |
| `react-redux` | 8.1.3 | 9.x | Requires React 18. |
| `@mui/material`, `@mui/icons-material` | 5.18.0 | 6/7.x | Requires React 18. |
| `react-router-dom` | 5.3.4 | 6 / 7 | v6 supports React 17 but is a **routing API rewrite** (`Switch`→`Routes`, `useHistory`→`useNavigate`, element props, etc.) touching `app.tsx` and the route loaders; v7 also requires React 18. |
| `i18next` | 22.4.6 | 26.x | Not React-18-blocked, but a 4-major jump with init/API changes — migrate + retest the i18n setup. |
| `react-i18next` | 11.18.6 | 17.x | Same (6-major jump; `Trans`/init changes). Peer allows React 17, so it can go independently of the React bump. |
| `strophe.js` | 1.2.16 | 4.x | Latest is a **release candidate** (`4.0.0-rc`); major API + ESM change. XMPP layer is covered by spot-webdriver E2E (and mocked in jest), so validate there. |
| spot-controller RN-ecosystem deps (`react-native-webview`, `react-native-side-menu`, `react-native-svg`, `react-native-keep-awake`, `@react-native-async-storage/async-storage`) | as-is | latest | Tied to RN 0.68 — bump together with the React Native upgrade. |

### Build tooling held (lower priority, would only need config tweaks)

- **spot-client**: `css-loader` 6→7, `style-loader` 3→4, `webpack-cli` 5→7, `webpack-dev-server` 4→5 — deferred to avoid webpack-config churn; current versions build fine.
- **spot-controller**: `metro-react-native-babel-preset` 0.76 — tied to RN 0.68.

---

## 2. Code / tooling cleanups (small, safe)

- **spot-client `tsconfig.json`** still has `allowJs: true` / `checkJs: false` (a safety net during migration). No `.js` remain under `src/`, so this can be set to `allowJs: false`, and `src/**/*.js` can be removed from the `ignores` in `eslint.config.mjs`.
- **spot-webdriver `specs/spot-tv-conflict.spec.ts`** references an undefined `conflictPage` (a **pre-existing** bug; the test is backend-gated and `pending()`s otherwise). It currently carries a `// @ts-expect-error`. Finish it by implementing a real `ConflictPage` page object.
- **Tighten `any` at boundaries** — spot-client uses `any`/`unknown` where it meets untyped surfaces (lib-jitsi-meet via `common/vendor`, the Jitsi external API, `window.spot`, loosely-typed Redux actions/state; `@typescript-eslint/no-explicit-any` is off there). A typed `RootState` + action unions + typed `common/vendor` could be introduced incrementally. Similarly, spot-electron's `node-osascript` / `win-audio` are typed via loose ambient declarations.
- **Docs generation** — `spot-client` `npm run docs` still runs `jsdoc`; consider `typedoc` now that the source is TypeScript.

---

## 3. Verify on CI / real hardware (not reproducible in a headless dev box)

These all pass their TS/lint/typecheck gates locally; the runtime/packaging steps run in CI or need specific hardware:

- **spot-webdriver E2E** — needs headless **Linux** Chrome (the `ci.yml` E2E job). Confirm the wdio 9 + TS suite is green on the PR.
- **electron-builder packaging** (`spot-electron` `npm run dist`) — mac (dmg/zip, notarization) and Windows (signing); gated on signing secrets. Runs in `ci_spot-electron.yml`.
- **React Native native build** (`spot-controller`) — `cd ios && pod install` + Xcode, and Android Gradle. Note: the `jetify` postinstall was removed (it would scan the hoisted root `node_modules`); run `npx jetify` manually before an Android build if a dependency needs it.
