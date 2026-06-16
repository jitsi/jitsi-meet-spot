# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`spot-client` is the main Spot subproject: a single webpack bundle (**strict TypeScript**, React 19 + Redux + redux-thunk) that runs as **either** Spot-TV **or** Spot-Remote depending on the route. This file covers spot-client internals; see the root `CLAUDE.md` for the monorepo-wide overview. It's an npm-workspaces member — `npm install` once at the repo root; the scripts below run from `spot-client/` (or `--workspace spot-client` from root).

## Commands

```bash
npm run start:dev          # webpack-dev-server on http://0.0.0.0:8000 (serves dist/ at /dist/)
npm run build:dev          # development webpack build into dist/
npm run build:prod         # production build (NODE_ENV=production, minified, source maps)
npm run build              # alias for build:prod (used by the root `npm run build`)
npm run typecheck          # tsc --noEmit -p tsconfig.json (strict; the real type gate)
npm run lint               # eslint . (flat config, eslint.config.mjs)
npm run lint:fix           # eslint --fix
npm test                   # jest (collects coverage into coverage/ by default)
```

**TypeScript toolchain:** the webpack bundle and jest both transpile `.ts`/`.tsx` via **babel `@babel/preset-typescript`** (type-stripping only — no type-checking in the build/test path), so type errors surface only from `npm run typecheck` (a separate `tsc --noEmit`). Run typecheck after edits.

Single tests (jest has no `npm` wrapper for filtering, call it directly):

```bash
npx jest src/common/emitter/Emitter.test.ts     # one file
npx jest -t "partial test name"                 # by test name
npx jest --watch                                # watch mode
```

Circular-dependency detection is opt-in: `DETECT_CIRCULAR_DEPS=1 npm run build:dev` (enables `CircularDependencyPlugin`, which `failOnError`).

## Architecture

### One bundle, two roles — entry flow
The build has a single entry, `src/index.tsx`. It is responsible for **bootstrapping before React renders**:
- builds the Redux store from `ReducerRegistry.combineReducers(reducers)` + `MiddlewareRegistry.applyMiddleware(thunk)`, seeded with persisted state, `startParams` (parsed query string), and config defaults via `setDefaultValues(window.JitsiMeetSpotConfig)`;
- subscribes `StateListenerRegistry`, the `RemoteControlServiceSubscriber`, and the `ExternalApiSubscriber` to the store;
- **loads `lib-jitsi-meet` and the Jitsi Meet external API at runtime** (`loadScript(getExternalApiUrl(...))` / `getLjmUrl(...)`, reading `config.EXTERNAL_API_SRC` / `config.LJM_SRC`) — these are **not bundled** — then renders `<App>`.

`src/app.tsx` (`App` component) is a React Router (**v7**) `<Routes>` whose route decides the role:
- **Spot-TV** routes (`ROUTES.MEETING`, `ROUTES.HOME`, `ROUTES.SETUP`, `ROUTES.OUTLOOK_OAUTH`) wrap their `element` in `SpotTvRestrictedRoute` (an element guard that renders the view or `<Navigate>`s away) and `SpotTVRemoteControlLoader`; views come from `spot-tv/ui` (`src/spot-tv/`).
- **Spot-Remote** routes (`ROUTES.HELP`, `ROUTES.SHARE`, `ROUTES.SHARE_HELP`, `ROUTES.REMOTE_CONTROL`, and the `path="*"` catch-all `JoinCodeEntry`) come from `spot-remote/ui` (`src/spot-remote/`).
- The router is an `unstable_HistoryRouter` over the shared `common/history` singleton (so thunks/services can navigate imperatively via `pushRoute`); `index.tsx` passes it the app `basename`. Class components that still need router props use the `common/routing/withRouter` shim (hooks-based).
- Shared code lives in `src/common/`. When changing a feature, decide whether it affects the TV side, the Remote side, or both.

The **bare imports** at the top of `src/index.tsx` and `src/app.tsx` (e.g. `import 'common/css'`, `import 'common/i18n'`, `import 'spot-tv/analytics'`, `import 'spot-tv/auto-update'`) exist for side effects: importing a feature entry is what **activates its registry registrations**. Removing such an import silently disables that feature.

### Redux + the registry pattern (`src/common/redux/`)
Features avoid inter-feature dependencies by registering with three singletons rather than wiring into a central file:
- `ReducerRegistry.register(name, reducer)` — adds a state slice (used by e.g. `common/backend`, `common/logger`, `common/auto-update`, `spot-tv/backend`, `spot-remote/app-state`).
- `MiddlewareRegistry.register(middleware)` — adds Redux middleware. **This is the primary home for side-effects / business logic** (per the style guide, keep it out of reducers). Most features have a `middleware.js` that calls this.
- `StateListenerRegistry.register(selector, listener)` — runs `listener` when the value derived by `selector` changes (currently used in `common/auto-update/AutoUpdateController.js` and `spot-tv/native-functions/middleware.js`).

Note the split: **core reducers are imported directly** in `src/common/app-state/index.js` and combined as `reducers` (slices: `bootstrap`, `calendars`, `config`, `deviceId`, `feedback`, `modal`, `notifications`, `remoteControlService`, `route`, `setup`, `spotTv`, `wiredScreenshare`), while feature reducers register via `ReducerRegistry`. A feature folder typically has `action-types.js`/`actionTypes.js`, `actions.js`, `reducer.js`, `selectors.js`, `middleware.js`, and an `index.js` re-export. `src/common/app-state/index.js` is the aggregate barrel that re-exports actions/selectors/constants for most slices.

### Remote Control Service — the TV ↔ Remote link (`src/common/remote-control/`)
TVs and Remotes communicate by joining a shared XMPP **MUC** (Prosody) and exchanging presence/messages, optionally upgrading to a **P2P** signaling channel for low latency.
- `BaseRemoteControlService.js` — shared base (extends `common/emitter`); owns the `XmppConnection` and P2P signaling. `connect(options)` joins/creates the MUC.
- `remoteControlServer.js` — the **Spot-TV** subclass (processes commands, broadcasts status). Exported as `remoteControlServer`.
- `remoteControlClient.js` — the **Spot-Remote** subclass (sends commands). Exported as `remoteControlClient`; `src/index.tsx` calls `remoteControlClient.configureWirelessScreensharing(...)`.
- `xmpp-connection.js` — Strophe-based MUC/presence layer. `P2PSignalingBase/Client/Server.js` + `P2PReconnectTrait.js` — the P2P path.
- `screenshare-connection.js` — wireless screensharing: manages a `ProxyConnectionService` so a Remote can push desktop video directly into the Jitsi meeting, with the TV brokering.
- `remote-control-service-subscriber.js` — bridges Redux state changes to the service (its `onUpdate` is called on every store change from `src/index.tsx`).

The conferencing UI itself is **Jitsi Meet embedded via the external iframe API** (`new JitsiMeetExternalAPI(...)` in `src/spot-tv/ui/components/meeting-frame/JitsiMeetingFrame/JitsiMeetingFrame.js`), not custom WebRTC UI. `lib-jitsi-meet` is accessed through `common/vendor` (`JitsiMeetJSProvider`), which is mocked in tests.

### Open-source mode vs backend mode
Mode is selected at runtime by **the presence of config values**, not a flag. `isBackendEnabled(state)` in `src/common/backend/selectors.js` is `Boolean(getSpotServicesConfig(state).pairingServiceUrl)` — i.e. backend mode turns on when `SPOT_SERVICES.pairingServiceUrl` (and related `CALENDARS.BACKEND`) are configured. Open-source mode uses a self-hosted Prosody with random MUC names; backend mode talks to a proprietary service (mocked by `spot-admin`) for room info, JWTs, and calendars. Backend code: `src/common/backend/` (`SpotBackendService`) and `src/spot-tv/backend/` (`SpotTvBackendService`).

### Config
Runtime config is `window.JitsiMeetSpotConfig`, set in `config.js` (copied into the build at `dist/config/config.js` by `CopyWebpackPlugin`). It overrides the defaults in `src/common/app-state/config/default-config.js` (merged by `setDefaultValues` in `src/common/app-state/config/set-default-values.js`). To change behavior, override keys in `config.js`; consult `default-config.js` for the full key set. `config.js` includes commented `SPOT_SERVICES` / `CALENDARS.BACKEND` examples pointing at `spot-admin` (`localhost:8001`).

## Conventions

- **Strict TypeScript.** `tsconfig.json` extends the repo's `tsconfig.base.json` (strict, `noUnusedLocals/Parameters`, `isolatedModules`) with `jsx: react` and `module`/`moduleResolution: ESNext`/`Bundler`. The JS→TS migration is complete: no `.js` remain in `src/` and `allowJs` is off. `@typescript-eslint/no-explicit-any` is **off**: use `any`/`unknown` freely at the untyped boundaries (lib-jitsi-meet via `common/vendor`, the Jitsi external API, `window.spot`, loosely-typed Redux actions/state). Asset imports (`*.scss`, `*.svg`, fonts) and `window.*` globals are declared in `src/global.d.ts`; untyped packages (strophe.js, @jitsi/logger, @jitsi/js-utils/*) are declared in the script-style `src/modules.d.ts`. The whole monorepo is on a **single React 19** (spot-controller is also React 19 via Expo SDK 56), so no React-deduping aliases are needed; `webpack.config.js` keeps a `fullySpecified: false` rule for MUI 9's ESM subpath imports.
- **Absolute imports from `src/`.** webpack (`resolve.modules` includes `./src`), jest (`modulePaths: ['<rootDir>/src']`), and tsc (`paths` for `common/*`, `spot-tv/*`, `spot-remote/*` — `baseUrl` is deprecated in TS6) all resolve `common/...`, `spot-tv/...`, `spot-remote/...`. Imports are extensionless. Use these instead of long relative paths.
- **Tests are colocated** as `*.test.ts(x)` next to the code (`testMatch: src/**/*.test.[jt]s?(x)`). Environment is jsdom; component tests use **React Testing Library** (`@testing-library/react` + `fireEvent`/`screen`; query MUI icons by their `data-testid="<Name>Icon"`). `setupTests.ts` registers `@testing-library/jest-dom` matchers, forces `TZ=UTC` (in `jest.config.js`), mocks `common/logger` and `common/vendor` (so `lib-jitsi-meet` is stubbed) and `strophe.js` (its old UMD can't load under jest 30 + jsdom), and enables `jest-fetch-mock`. `transformIgnorePatterns` whitelists `@jitsi/js-utils`. Per the style guide, unit tests are committed selectively (favor standalone/utility modules); critical paths are covered by WebdriverIO tests in `spot-webdriver/`.
- **Linting** is the eslint **flat config** (`eslint.config.mjs`): `@eslint/js` + `typescript-eslint` recommended (the eslintrc-era `@jitsi/eslint-config` + its jsdoc/react configs were dropped). `no-console` is a warning; `no-unused-vars` ignores `^_`-prefixed and rest-siblings (matching tsc). Lint covers the whole project (`eslint .`).
- **Global SCSS, not CSS modules.** Styles live centrally under `src/common/css/` (imported once via `import 'common/css'` in `src/index.tsx`); this is deliberate — see `docs/style-guide.md` and `docs/adding-css.md` (use `em` units + media queries for the wide range of TV/phone resolutions). Do not add per-component CSS modules.
- **Icons** are added per `docs/adding-new-icons.md`: material icons re-exported from `src/common/icons/`, custom icons packed into a ligature font via icomoon (`selection.json` + font files), then wrapped as components and exported from the icons feature so all icons are used the same way.
- **Logging & analytics:** log liberally for debuggability but **never log personally identifiable information** (only the random device-id). Send analytics events for major user actions (`src/common/analytics/`, `src/spot-tv/analytics/`, `src/spot-remote/analytics/`).

## Docs

`docs/` holds spot-client-specific references worth reading before deep work:
- `glossary.md` — domain terms (Join code/Share key, Permanent vs Temporary remote, Share mode, Wired vs Wireless screensharing, MUC, RCS/Remote Control Service, Backend vs Open-source flow).
- `style-guide.md` — the *why* behind the architecture (minimal Redux, global CSS, logging, when to commit tests).
- `wireless_screensharing.md`, `faking_screenshare_dongle.md`, `creating_a_huddle_room_calendar.md`, `analytics.md`, `manual-test-plan.md`.
