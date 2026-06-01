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
| `strophe.js` | 1.2.16 | — (**held by decision**) | **Decision (2026-06): keep at 1.2.16, do not upgrade.** 4.x is a from-scratch ESM rewrite shipping only as a release candidate (`4.0.0-rc`). The direct surface here is small (`$iq` builder + `Strophe.getResourceFromJid`, ~7 sites in `common/remote-control/`; the live transport is lib-jitsi-meet's own Strophe), but jest fully mocks strophe so the only real gate is the Linux-only E2E — not worth the RC risk. Revisit only if a stable 4.x ships and there's a concrete need. |
| spot-controller RN-ecosystem deps (`react-native-webview`, `react-native-side-menu`, `react-native-svg`, `react-native-keep-awake`, `@react-native-async-storage/async-storage`) | as-is | latest | Tied to RN 0.68 — bump together with the React Native upgrade. |

### Build tooling held (lower priority, would only need config tweaks)

- **spot-controller**: `metro-react-native-babel-preset` 0.76 — tied to RN 0.68.

(spot-client's `css-loader`/`style-loader`/`webpack-cli`/`webpack-dev-server` bumps are **done** — see [§4 Done](#4-done-post-migration-follow-ups).)

---

## 2. Code / tooling cleanups (small, safe)

- **spot-webdriver `specs/spot-tv-conflict.spec.ts`** carries a `// @ts-expect-error` over a call to an undefined `conflictPage.clickRetry()` (a **pre-existing** dangling reference; the test is backend-gated and `pending()`s in CI). ⚠️ **Do _not_ "implement a real ConflictPage"** — the conflict view + retry button + the old `conflict-page.js` page object were **deliberately removed** in commit `64b59626` ("conflict is now silent background retry + an error notification"; the `conflict-view`/`conflict-retry` selectors no longer exist). Re-scope to a spec fix: drop the `@ts-expect-error` + `clickRetry()` line and assert the `appStatus.tvConflict` error notification, then wait for `CalendarPage` recovery (reuse `page-objects/notifications.ts`). Value is typecheck/lint only — the spec `pending()`s in the open-source Linux E2E job.
- **Tighten `any` at boundaries** — spot-client uses `any`/`unknown` where it meets untyped surfaces (lib-jitsi-meet via `common/vendor`, the Jitsi external API, `window.spot`, loosely-typed Redux actions/state; `@typescript-eslint/no-explicit-any` is off there). **A typed `RootState` rollout is mostly done** (commits `8d71d342`, `8e2d61b0`, `de2f336f`): `common/app-state/types.ts` aggregates all 17 store slices, and the 17 reducer `state` params, all 16 `selectors.ts` files, and every `mapStateToProps`/`useSelector`/store-subscriber consumer now use `RootState`. Repo-wide `state: any` dropped **163 → 5**. **Remaining:** the 5 are deliberate non-Redux holdouts (`XmppConnection.state` field, `remoteControlClient._onSpotTvStatusReceived` payload, `parsePersistedState` blob, and the generic `Selector` type in `StateListenerRegistry`). Separately still open: type `common/vendor` (lib-jitsi-meet) and the `window.*` Jitsi globals; consider action unions; optionally wire `RootState` into `createStore` (the registry combines reducers as a loose `Reducer`); a handful of selectors still cast to preserve their public return type (`getDeviceId`/`getRemoteJoinCode`/`getApiReceivedJoinCode`/`getPermanentPairingCode` cast to `string`; `getPreferredResolution`/`getWiredScreenshareInputIdleValue` return `any` at the boundary). spot-electron's `node-osascript` / `win-audio` already use loose ambient `unknown` declarations (low priority).
- **Docs generation** — `spot-client` `npm run docs` still runs `jsdoc`; consider `typedoc` now that the source is TypeScript.

---

## 3. Verify on CI / real hardware (not reproducible in a headless dev box)

These all pass their TS/lint/typecheck gates locally; the runtime/packaging steps run in CI or need specific hardware:

- **spot-webdriver E2E** — needs headless **Linux** Chrome (the `ci.yml` E2E job). Confirm the wdio 9 + TS suite is green on the PR.
- **electron-builder packaging** (`spot-electron` `npm run dist`) — mac (dmg/zip, notarization) and Windows (signing); gated on signing secrets. Runs in `ci_spot-electron.yml`.
- **React Native native build** (`spot-controller`) — `cd ios && pod install` + Xcode, and Android Gradle. Note: the `jetify` postinstall was removed (it would scan the hoisted root `node_modules`); run `npx jetify` manually before an Android build if a dependency needs it.

---

## 4. Done (post-migration follow-ups)

- **spot-client build-tooling bumps** (commit `1c4f5442`) — `css-loader` 7.1.4, `style-loader` 4.0.0, `webpack-cli` 7.0.3, `webpack-dev-server` 5.2.4; `start:dev` → `webpack serve`. No webpack-config changes were needed (no loader options, no CSS modules, devServer already on the v5 API). Verified: typecheck/lint/build:prod/jest (229) + a `webpack serve` smoke test.
- **spot-client `allowJs` cleanup** (commit `1c4f5442`) — dropped `allowJs`/`checkJs` from `tsconfig.json` and removed `src/**/*.js` from the eslint flat-config ignores; fixed stale `src/index.js`/`src/app.js` → `.tsx` references in `spot-client/CLAUDE.md`.
- **Typed `RootState` rollout** (commits `8d71d342`, `8e2d61b0`, `de2f336f`) — added `common/app-state/types.ts` aggregating all 17 store slices and migrated the reducers + all 16 `selectors.ts` + every `mapStateToProps`/`useSelector`/store-subscriber consumer off `state: any` (repo-wide 163 → 5; the 5 are deliberate non-Redux holdouts). Details/remaining in §2.
- **i18next 22→26 + react-i18next 11→17** (commit `085f7cda`) — both React-17-compatible (react-i18next 17 peer is `react >= 16.8.0`). Tiny surface (one 19-line init + `withTranslation` ×52). Migrated the lone plural key to i18next's v4 JSON format (`timeLeft_one`/`timeLeft_other`); verified plural resolution against i18next 26 directly since jest mocks `t`. Verified typecheck/lint/229 tests/prod build.
