# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the `spot-webdriver` subproject: WebdriverIO 8 + Jasmine Selenium E2E tests that drive `spot-client` (running as Spot-TV and Spot-Remote) in Chrome via chromedriver. See the root `CLAUDE.md` for the monorepo overview. There is no source code to build here — it is purely a test harness.

## Commands

Run from inside `spot-webdriver/` (no root `package.json` exists in the monorepo).

```bash
npm install                # also force-downloads a Chrome-for-Testing chromedriver (see .npmrc)

npm run ci                 # full flow: start the spot-client dev server, wait for it, then run tests
npm test                   # run all specs against an ALREADY-running client (./node_modules/.bin/wdio wdio.conf.js)
npm run start-spot-client  # just start the client dev server (npm --prefix ../spot-client run start:dev)
npm run lint               # eslint .
```

- `npm run ci` is `start-server-and-test start-spot-client http://127.0.0.1:8000/ test` — it boots `../spot-client`'s dev server, polls `http://127.0.0.1:8000/` until it responds, runs the test suite, then tears the server down. This is exactly what CI does.
- `npm test` assumes a Spot deployment is already serving at `http://127.0.0.1:8000` (override with `TEST_SERVER_URL`). Use it when iterating with a manually-started client.
- **Run a single spec** (no npm script for it — call the binary directly):
  ```bash
  npx wdio run ./wdio.conf.js --spec specs/join-code.spec.js
  ```

### Environment variables (read in `wdio.conf.js` and `constants/index.js`)

- `TEST_SERVER_URL` — base URL of the Spot deployment under test (default `http://127.0.0.1:8000`). Drives the `/tv` and `/help` URLs and the join-code entry URL in `constants/index.js`.
- `BACKEND_REFRESH_TOKEN` — when set, enables "backend mode" tests; specs that require it are gated behind `SpotSession.isBackendEnabled()` and `pending()` otherwise (see `user/spot-session.js`, README for how to obtain the token from `localStorage`).
- `BROWSER_VERSION` (default `stable`), `LOG_LEVEL` (default `info`), `MAX_INSTANCES` (default `1`).

## Architecture

Three layers sit between a `.spec.js` file and the browser: **specs → users/session → page objects → WebdriverIO driver**. A new contributor needs to understand how these connect.

### Two browsers, "multiremote"

`wdio.conf.js` declares **two named capabilities** under a single multiremote session: `spotBrowser` and `remoteControlBrowser` (names exported as `constants.SPOT_BROWSER` / `constants.REMOTE_CONTROL_BROWSER`). One browser plays the Spot-TV, the other the Spot-Remote, so a single test exercises a real TV ↔ Remote interaction. Because it is multiremote, you never use the global `browser` directly for driver calls — instead everything indexes by capability name: `browser[this.driver]...`, where `this.driver` is the capability name string (`'spotBrowser'` / `'remoteControlBrowser'`). The base `PageObject` and `SpotUser` classes always route through `browser[this.driver]`.

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

`describe/it`, async/await throughout. Convention: create a session at the top of `describe` via `spotSessionStore.createSession()`, drive flows through the session/user/page-object methods, assert with Jasmine `expect`. Files: `adhoc-meeting`, `in-meeting`, `join-code`, `share-mode`, `spot-tv-conflict`, `spot-tv-reconnect`, `waiting-for-tv`, `wireless-screenshare`. Several suites are currently disabled with `xdescribe`/`xit` (e.g. `wireless-screenshare.spec.js`) — check for the `x` prefix before assuming a spec runs. Backend-only cases call `pending()` when `BACKEND_REFRESH_TOKEN` is unset.

There are **no global wdio hooks** in `wdio.conf.js` and no shared `afterAll`; teardown is explicit. `SpotUser.cleanup()` (restore network, disconnect RCS, clear storage, navigate to `about:blank`) — invoked either directly on a user or via `SpotSession.cleanup()` (which cleans up both the remote and the TV) — is called within specs that need it (e.g. `spot-tv-conflict.spec.js` calls `spotTv1.cleanup()`).

### Supporting modules

- `constants/index.js` — all timeouts (`MAX_PAGE_LOAD_WAIT` 120000, `MEETING_JOIN_WAIT`, `P2P_ESTABLISHED_WAIT`, `SIGNALING_DISCONNECT_TIMEOUT`, etc.), URL builders derived from `TEST_SERVER_URL`, capability-name constants, and the fake-video filename. `wdio.conf.js` sets Jasmine's `defaultTimeoutInterval` to `MAX_PAGE_LOAD_WAIT + 30000`.
- `screen-info/index.js` — shells out (`system_profiler` on macOS, `xdpyinfo` on Linux, `wmic` on Windows) to count monitors; `wdio.conf.js` uses this to pick the `auto-select-desktop-capture-source` name (`Screen 1` vs `Entire screen`).
- `resources/static-image.y4m` — the fake camera feed. A static image is used deliberately so the fake camera can stand in for a screenshare dongle source without tripping Spot-TV's camera-change auto-join detection (see comment in `constants/index.js`).

### Reporters / output

`wdio.conf.js` uses the `spec`, `junit`, and `timeline` (`wdio-timeline-reporter`, with screenshots `before:click`) reporters. JUnit XML and the timeline (with embedded images) are written to `./webdriver-results`, which CI archives as the `webdriver-results` artifact.

## Conventions

- **CommonJS only** — every file uses `require`/`module.exports` (no ES module `import`). `babel.config.js` targets Node 14 via `@babel/preset-env`; WebdriverIO loads specs through `@babel/register`.
- **Never call the global `browser` for driver actions** in new code — index by capability (`browser[this.driver]`) so the action targets the correct TV or Remote browser. The global `browser` is declared as an ESLint global only because of one legacy spec.
- **Selectors live in page objects** as top-level constants; specs and user models stay selector-free.
- **App-internal polling** goes through `browser[driver].execute(...)` against `window.spot.*`; keep that code defensive (try/catch returning a falsy default) since it runs during connect/reconnect races.
- **Lint** extends `eslint-config-jitsi` + its jsdoc config (`.eslintrc`); JSDoc on methods is expected, `max-len` 120, `no-console` is a warning. `.eslintignore` excludes `node_modules`.
- **chromedriver** is pinned and force-downloaded from the Chrome-for-Testing bucket via `.npmrc` (`chromedriver_force_download=true`, `chromedriver_cdnbinariesurl=...`) so the binary matches the managed Chrome build rather than whatever is preinstalled.
- **CI runs on Linux only.** The E2E job in `.github/workflows/ci_spot-client.yml` runs on `ubuntu-latest`, installs both `spot-client` and `spot-webdriver`, and runs `npm run ci` from `spot-webdriver`. Chrome's fake-getUserMedia pipeline stalls on macOS runners, so keep E2E on Linux headless with `--no-sandbox`.
