# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`spot-client` is the main Spot subproject: a single webpack bundle (React 17 + Redux + redux-thunk) that runs as **either** Spot-TV **or** Spot-Remote depending on the route. This file covers spot-client internals; see the root `CLAUDE.md` for the monorepo-wide overview. Run all commands from inside `spot-client/`.

## Commands

```bash
npm install
npm run start:dev          # webpack-dev-server on http://0.0.0.0:8000 (serves dist/ at /dist/)
npm run build:dev          # development webpack build into dist/
npm run build:prod         # production build (NODE_ENV=production, minified, source maps)
npm run lint               # eslint . --max-warnings=0 (any warning fails)
npm run lint:fix           # eslint --fix
npm test                   # jest (collects coverage into coverage/ by default)
npm run docs               # jsdoc -c ./jsdoc.config.js -> dist/jsdoc
```

Single tests (jest has no `npm` wrapper for filtering, call it directly):

```bash
npx jest src/common/emitter/Emitter.test.js     # one file
npx jest -t "partial test name"                 # by test name
npx jest --watch                                # watch mode
```

Circular-dependency detection is opt-in: `DETECT_CIRCULAR_DEPS=1 npm run build:dev` (enables `CircularDependencyPlugin`, which `failOnError`).

## Architecture

### One bundle, two roles — entry flow
The build has a single entry, `src/index.js`. It is responsible for **bootstrapping before React renders**:
- builds the Redux store from `ReducerRegistry.combineReducers(reducers)` + `MiddlewareRegistry.applyMiddleware(thunk)`, seeded with persisted state, `startParams` (parsed query string), and config defaults via `setDefaultValues(window.JitsiMeetSpotConfig)`;
- subscribes `StateListenerRegistry`, the `RemoteControlServiceSubscriber`, and the `ExternalApiSubscriber` to the store;
- **loads `lib-jitsi-meet` and the Jitsi Meet external API at runtime** (`loadScript(getExternalApiUrl(...))` / `getLjmUrl(...)`, reading `config.EXTERNAL_API_SRC` / `config.LJM_SRC`) — these are **not bundled** — then renders `<App>`.

`src/app.js` (`App` component) is a React Router `<Switch>` whose route decides the role:
- **Spot-TV** routes (`ROUTES.MEETING`, `ROUTES.HOME`, `ROUTES.SETUP`, `ROUTES.OUTLOOK_OAUTH`) are wrapped in `SpotTvRestrictedRoute` and `SpotTVRemoteControlLoader`; views come from `spot-tv/ui` (`src/spot-tv/`).
- **Spot-Remote** routes (`ROUTES.HELP`, `ROUTES.SHARE`, `ROUTES.SHARE_HELP`, `ROUTES.REMOTE_CONTROL`, and the catch-all `JoinCodeEntry`) come from `spot-remote/ui` (`src/spot-remote/`).
- Shared code lives in `src/common/`. When changing a feature, decide whether it affects the TV side, the Remote side, or both.

The **bare imports** at the top of `src/index.js` and `src/app.js` (e.g. `import 'common/css'`, `import 'common/i18n'`, `import 'spot-tv/analytics'`, `import 'spot-tv/auto-update'`) exist for side effects: importing a feature entry is what **activates its registry registrations**. Removing such an import silently disables that feature.

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
- `remoteControlClient.js` — the **Spot-Remote** subclass (sends commands). Exported as `remoteControlClient`; `src/index.js` calls `remoteControlClient.configureWirelessScreensharing(...)`.
- `xmpp-connection.js` — Strophe-based MUC/presence layer. `P2PSignalingBase/Client/Server.js` + `P2PReconnectTrait.js` — the P2P path.
- `screenshare-connection.js` — wireless screensharing: manages a `ProxyConnectionService` so a Remote can push desktop video directly into the Jitsi meeting, with the TV brokering.
- `remote-control-service-subscriber.js` — bridges Redux state changes to the service (its `onUpdate` is called on every store change from `src/index.js`).

The conferencing UI itself is **Jitsi Meet embedded via the external iframe API** (`new JitsiMeetExternalAPI(...)` in `src/spot-tv/ui/components/meeting-frame/JitsiMeetingFrame/JitsiMeetingFrame.js`), not custom WebRTC UI. `lib-jitsi-meet` is accessed through `common/vendor` (`JitsiMeetJSProvider`), which is mocked in tests.

### Open-source mode vs backend mode
Mode is selected at runtime by **the presence of config values**, not a flag. `isBackendEnabled(state)` in `src/common/backend/selectors.js` is `Boolean(getSpotServicesConfig(state).pairingServiceUrl)` — i.e. backend mode turns on when `SPOT_SERVICES.pairingServiceUrl` (and related `CALENDARS.BACKEND`) are configured. Open-source mode uses a self-hosted Prosody with random MUC names; backend mode talks to a proprietary service (mocked by `spot-admin`) for room info, JWTs, and calendars. Backend code: `src/common/backend/` (`SpotBackendService`) and `src/spot-tv/backend/` (`SpotTvBackendService`).

### Config
Runtime config is `window.JitsiMeetSpotConfig`, set in `config.js` (copied into the build at `dist/config/config.js` by `CopyWebpackPlugin`). It overrides the defaults in `src/common/app-state/config/default-config.js` (merged by `setDefaultValues` in `src/common/app-state/config/set-default-values.js`). To change behavior, override keys in `config.js`; consult `default-config.js` for the full key set. `config.js` includes commented `SPOT_SERVICES` / `CALENDARS.BACKEND` examples pointing at `spot-admin` (`localhost:8001`).

## Conventions

- **Absolute imports from `src/`.** Both webpack (`resolve.modules` includes `./src`) and jest (`modulePaths: ['<rootDir>/src']`) resolve `common/...`, `spot-tv/...`, `spot-remote/...`. Use these instead of long relative paths.
- **Tests are colocated** as `*.test.js` next to the code (`testMatch: src/**/*.test.js`). Environment is jsdom; component tests use `enzyme` with the React-17 adapter (`@wojtekmaj/enzyme-adapter-react-17`, configured in `setupTests.js`). `setupTests.js` also forces `TZ=UTC` (in `jest.config.js`), mocks `common/logger` and `common/vendor` (so `lib-jitsi-meet` is stubbed), and enables `jest-fetch-mock`. `transformIgnorePatterns` whitelists `@jitsi/js-utils` for transpilation. Per the style guide, unit tests are committed selectively (favor standalone/utility modules); critical paths are covered by WebdriverIO tests in the `spot-webdriver/` subproject.
- **Linting is strict.** `@jitsi/eslint-config` + its `/jsdoc` and `/react` configs, `@babel/eslint-parser`, `--max-warnings=0`. **JSDoc comments are expected on methods/components** (the jsdoc rules enforce this); `no-console` is a warning (and warnings fail). Lint covers the whole project (`eslint .`), not just `src/`.
- **Global SCSS, not CSS modules.** Styles live centrally under `src/common/css/` (imported once via `import 'common/css'` in `src/index.js`); this is deliberate — see `docs/style-guide.md` and `docs/adding-css.md` (use `em` units + media queries for the wide range of TV/phone resolutions). Do not add per-component CSS modules.
- **Icons** are added per `docs/adding-new-icons.md`: material icons re-exported from `src/common/icons/`, custom icons packed into a ligature font via icomoon (`selection.json` + font files), then wrapped as components and exported from the icons feature so all icons are used the same way.
- **Logging & analytics:** log liberally for debuggability but **never log personally identifiable information** (only the random device-id). Send analytics events for major user actions (`src/common/analytics/`, `src/spot-tv/analytics/`, `src/spot-remote/analytics/`).

## Docs

`docs/` holds spot-client-specific references worth reading before deep work:
- `glossary.md` — domain terms (Join code/Share key, Permanent vs Temporary remote, Share mode, Wired vs Wireless screensharing, MUC, RCS/Remote Control Service, Backend vs Open-source flow).
- `style-guide.md` — the *why* behind the architecture (minimal Redux, global CSS, logging, when to commit tests).
- `wireless_screensharing.md`, `faking_screenshare_dongle.md`, `creating_a_huddle_room_calendar.md`, `analytics.md`, `manual-test-plan.md`.
