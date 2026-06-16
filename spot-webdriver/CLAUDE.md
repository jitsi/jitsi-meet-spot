# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the `spot-webdriver` subproject: **WebdriverIO 9 + Jasmine** Selenium E2E tests that drive `spot-client` (running as Spot-TV and Spot-Remote) in Chrome. See the root `CLAUDE.md` for the monorepo overview. It is **strict TypeScript** + **native ESM** and is an npm-workspaces member. There is no build step — WebdriverIO loads the `.ts` specs/config directly via `tsx`; `tsc --noEmit` is used only for type-checking. wdio 9 **auto-manages the Chrome-for-Testing driver** (the old `chromedriver` dep + `.npmrc` are gone).

## Commands

Install once from the **repository root**. The scripts below run from inside `spot-webdriver/` (or from root with `npm run <script> --workspace spot-webdriver`):

```bash
npm run ci                 # full flow (open-source mode): start the spot-client dev server, wait for it, then run the E2E suite
npm run ci:backend         # full flow (backend mode): also boots spot-admin, points spot-client at it, runs the suite with BACKEND_REFRESH_TOKEN set
npm run e2e                # run all specs against an ALREADY-running client (wdio run wdio.conf.ts)
npm run start-spot-client  # just start the client dev server (npm --prefix ../spot-client run start:dev)
npm run start-spot-admin   # just start the spot-admin mock backend (npm --prefix ../spot-admin run start:dev)
npm run lint               # eslint . (flat config)
npm run typecheck          # tsc --noEmit -p tsconfig.json (strict)
```

- The E2E script is named `e2e` (not `test`) so the monorepo-wide `npm run test` unit-test sweep does not try to launch the browser suite. `npm run typecheck` and `npm run lint` DO participate in the root sweeps.
- `npm run ci` is `start-server-and-test start-spot-client http://127.0.0.1:8000/ e2e` — it boots `../spot-client`'s dev server, polls until it responds, runs the suite, then tears the server down. This is exactly what the `e2e` CI job does (open-source mode).
- `npm run ci:backend` additionally boots the `../spot-admin` mock backend and starts spot-client in **backend mode**: a single `cross-env` sets the spot-client build-time vars (`PAIRING_SERVICE_URL`/`ROOM_KEEPER_SERVICE_URL`/`CALENDAR_SERVICE_URL` → `localhost:8001`), seeds spot-admin with a fixed `REFRESH_TOKEN`, and hands the suite the same value as `BACKEND_REFRESH_TOKEN`. `start-server-and-test` gates on spot-admin's `/health` then spot-client's `/`. This is the `e2e-backend` CI job, and it's what makes the backend-only specs (`spot-tv-conflict`, `waiting-for-tv`, `adhoc-meeting`, the backend blocks of `spot-tv-reconnect`/`share-mode`) actually run instead of `pending()`. (`cross-env` is a root-hoisted devDependency.)
- `npm run e2e` assumes a Spot deployment is already serving at `http://127.0.0.1:8000` (override with `TEST_SERVER_URL`). Use it when iterating with a manually-started client.
- **The E2E run is Linux-only** — Chrome's fake-getUserMedia pipeline stalls on the macOS runners, so the run is verified on the Linux CI job, not locally on macOS. typecheck/lint are the local gates.
- **Run a single spec** (no npm script — call the binary directly):
  ```bash
  npx wdio run ./wdio.conf.ts --spec specs/join-code.spec.ts
  ```

### Environment variables (read in `wdio.conf.ts` and `constants/index.ts`)

- `TEST_SERVER_URL` — base URL of the Spot deployment under test (default `http://127.0.0.1:8000`). Drives the `/tv` and `/help` URLs and the join-code entry URL in `constants/index.js`.
- `BACKEND_REFRESH_TOKEN` — when set, enables "backend mode" tests; specs that require it are gated behind `SpotSession.isBackendEnabled()` and `pending()` otherwise (see `user/spot-session.ts`, README for how to obtain the token from `localStorage`).
- `BROWSER_VERSION` (default `stable`), `LOG_LEVEL` (default `info`), `MAX_INSTANCES` (default `1`).

## Architecture

Three layers sit between a `.spec.js` file and the browser: **specs → users/session → page objects → WebdriverIO driver**. A new contributor needs to understand how these connect.

### Two browsers, "multiremote"

`wdio.conf.ts` declares **two named capabilities** under a single multiremote session: `spotBrowser` and `remoteControlBrowser` (names exported as `constants.SPOT_BROWSER` / `constants.REMOTE_CONTROL_BROWSER`, with a `BrowserName` union type). One browser plays the Spot-TV, the other the Spot-Remote, so a single test exercises a real TV ↔ Remote interaction. Because it is multiremote, you never use the global `browser` directly for driver calls — instead you resolve the per-capability instance. The base `PageObject` and `SpotUser` classes expose a `protected get _browser(): WebdriverIO.Browser` getter (backed by the `driverFor(name)` helper in `helpers/driver.ts`) and always route driver calls through `this._browser`. `this.driver` holds the capability name (typed `BrowserName`).

Both Chrome instances launch with `use-fake-device-for-media-stream`, `use-fake-ui-for-media-stream`, `use-file-for-fake-video-capture=resources/static-image.y4m`, and `--ignore-certificate-errors`. The `remoteControlBrowser` additionally gets `auto-select-desktop-capture-source=<screen>` for screenshare tests. On CI the headless Linux args (`--headless=new`, `--no-sandbox`, `--disable-dev-shm-usage`) are appended.

### `user/` — the test-facing model

This is the layer specs actually call.

- `user/spot-user.js` — `SpotUser` base class. Wraps lifecycle and signaling concerns that aren't UI: `cleanup()`, `clearStorage()`, `setNetworkOffline()/setNetworkOnline()` (Chrome network conditions), `stopP2PConnection()`, and the `waitForSignalingConnection*` / `waitForP2PConnectionEstablished` polls. These reach into the running app via `browser[driver].execute(...)` against the page's `window.spot[...]` globals (e.g. `window.spot.remoteControlServer`, `window.spot.remoteControlClient`, `window.spot.store`). The RCS global name is passed up from the subclass constructor.
- `user/spot-tv-user.js` — `SpotTV extends SpotUser` (RCS name `'remoteControlServer'`). Owns the TV-side page objects: `AdminPage`, `CalendarPage`, `MeetingPage`. Helpers: `getShortLivedPairingCode()`, `getMeetingName()`.
- `user/spot-remote-user.js` — `SpotRemote extends SpotUser` (RCS name `'remoteControlClient'`). Owns the Remote-side page objects: `JoinCodePage`, `RemoteControlPage`, `ModeSelectPage`, `StopSharePage`, `InMeetingPage`.
- `user/spot-session.js` — `SpotSession` orchestrates a TV+Remote pair through real flows: `startSpotTv()`, `startSpotRemote()`, `connectRemoteToTV()` (gets the TV's join code, submits it on the Remote, waits for P2P), `joinMeeting()`, `connectScreeshareOnlyRemoteToTV()`, `startPermanentSpotRemote()`. Most specs begin with `session.connectRemoteToTV()` in `beforeEach`.
- `user/user-factory.js` — lazily constructs the two singletons bound to the two capabilities. `user/spotSessionStore.js` is a singleton `SpotSessionStore`; `spotSessionStore.createSession()` is the standard entry point at the top of a `describe`.

### `page-objects/` — UI wrappers (page-object pattern)

Every page object extends `page-objects/page-object.js` (`PageObject`), constructed with `(driver, rootSelector)`. The base provides the only selector vocabulary used: `select()`, `waitForElementDisplayed()`, `waitForElementHidden()`, `waitForBooleanState()`, `waitForVisible()`, `waitForHidden()` — all built on `browser[this.driver].$(...)`. Selectors are module-level constants (CSS or XPath) at the top of each file; tests never embed raw selectors (one legacy exception: `specs/join-code.spec.js` uses the global `browser` and a raw selector directly).

Notable page objects: `calendar-page.js` (TV home; scrapes the join code, navigates to admin, `visit(queryParams, visibilityWait)` builds the `/tv` URL), `meeting-page.js` (TV in-meeting state), `spot-remote-in-meeting-page.js` (Remote's in-call controls — mute, screenshare, hang up), `remote-control-page.js` (Remote "waiting for call" / Meet Now), `join-code-page.js`, `admin-page.js`, `loading-screen.js` (reconnect spinner states), `notifications.js`, `screenshare-picker.js`. Page objects may also poll app internals via `browser[driver].execute(() => window.spot.store.getState()...)` when there is no UI signal to wait on (see `remote-control-page.js`).

### `specs/` — Jasmine specs

`describe/it`, async/await throughout. Convention: create a session at the top of `describe` via `spotSessionStore.createSession()`, drive flows through the session/user/page-object methods, assert with Jasmine `expect`. Files: `adhoc-meeting`, `in-meeting`, `join-code`, `share-mode`, `spot-tv-conflict`, `spot-tv-reconnect`, `waiting-for-tv`, `wireless-screenshare` (all `*.spec.ts`). Several suites are currently disabled with `xdescribe`/`xit` (e.g. `wireless-screenshare.spec.ts`) — check for the `x` prefix before assuming a spec runs. Backend-only cases call `pending()` when `BACKEND_REFRESH_TOKEN` is unset — e.g. `spot-tv-conflict.spec.ts`, which asserts that a second Spot-TV joining an occupied room shows the conflict **error notification** and then automatically recovers to the calendar once the first leaves. There is no dedicated conflict UI/page object: the conflict view + retry button were removed long ago (commit `64b59626`); conflict is now a silent background retry plus an error notification.

There are **no global wdio hooks** in `wdio.conf.ts` and no shared `afterAll`; teardown is explicit. `SpotUser.cleanup()` (restore network, disconnect RCS, clear storage, navigate to `about:blank`) — invoked either directly on a user or via `SpotSession.cleanup()` (which cleans up both the remote and the TV) — is called within specs that need it (e.g. `spot-tv-conflict.spec.ts` calls `spotTv1.cleanup()`).

### Supporting modules

- `constants/index.ts` — all timeouts (`MAX_PAGE_LOAD_WAIT` 120000, `MEETING_JOIN_WAIT`, `P2P_ESTABLISHED_WAIT`, `SIGNALING_DISCONNECT_TIMEOUT`, etc.) as **named exports**, URL builders derived from `TEST_SERVER_URL`, capability-name constants, the fake-video filename, and the `BrowserName` type. Import with `import * as constants from '../constants/index.js'`. `wdio.conf.ts` sets Jasmine's `defaultTimeoutInterval` to `MAX_PAGE_LOAD_WAIT + 30000`.
- `screen-info/index.ts` — shells out (`system_profiler` on macOS, `xdpyinfo` on Linux, `wmic` on Windows) to count monitors; `wdio.conf.ts` uses this to pick the `auto-select-desktop-capture-source` name (`Screen 1` vs `Entire screen`).
- `helpers/driver.ts` — `driverFor(name)` resolves a capability name to its `WebdriverIO.Browser` in the multiremote session; the base classes' `_browser` getter wraps it.
- `types/globals.d.ts` — ambient `Window.spot` declaration (typed `Record<string, any>`) for the `execute()` callbacks that poll app internals.
- `resources/static-image.y4m` — the fake camera feed. A static image is used deliberately so the fake camera can stand in for a screenshare dongle source without tripping Spot-TV's camera-change auto-join detection.

### Reporters / output

`wdio.conf.ts` uses the `spec` and `junit` reporters; JUnit XML is written to `./webdriver-results`, which CI archives as the `webdriver-results` artifact. (The old `wdio-timeline-reporter` was dropped — it predates wdio 9 and risked breaking the run.)

## Conventions

- **Strict TypeScript + native ESM.** `"type": "module"`; `tsconfig.json` extends the repo base with `module`/`moduleResolution: NodeNext`, `target: ES2023`, `lib: ["ES2023", "DOM"]` (DOM for the `window`/`localStorage`/`document` referenced inside `execute()` callbacks), and `types: ["node", "@wdio/globals/types", "jasmine"]`. **Relative imports carry explicit `.js` extensions** even from `.ts`. No build step — wdio runs the `.ts` directly via `tsx`; `tsc --noEmit` only type-checks.
- **Never call the global `browser` for driver actions** in new code — route through `this._browser` (from the base `PageObject` / `SpotUser`) so the action targets the correct TV or Remote browser. The global `browser` remains for the one legacy `join-code` spec.
- **Selectors live in page objects** as top-level constants; specs and user models stay selector-free.
- **App-internal polling** goes through `this._browser.execute(...)` against `window.spot.*` (ambiently typed `Record<string, any>`); keep that code defensive (try/catch returning a falsy default) since it runs during connect/reconnect races. wdio 9 `execute` accepts async functions, so the old `executeAsync(done => ...)` style was replaced with `execute(async () => ...)`.
- **Lint** is the eslint flat config (`eslint.config.mjs`): `@eslint/js` + `typescript-eslint` recommended, jasmine/node/browser globals, `max-len` 120, `no-console` warn. `@typescript-eslint/no-explicit-any` is **off** here because the harness reaches into the app's untyped `window.spot.*` internals.
- **Driver management** is automatic in wdio 9 (no `chromedriver` dep / `.npmrc`); the managed Chrome-for-Testing build is selected via `browserVersion` in the capabilities.
- **CI runs on Linux only.** The two E2E jobs in `.github/workflows/ci.yml` (`e2e` → `npm run ci`, open-source mode; `e2e-backend` → `npm run ci:backend`, backend mode) both run on `ubuntu-latest`, install at the workspace root, and run from `spot-webdriver`. Chrome's fake-getUserMedia pipeline stalls on macOS runners, so keep E2E on Linux headless with `--no-sandbox`.
