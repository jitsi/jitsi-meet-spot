# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`spot-electron` is an Electron desktop app whose only job is to host a **Spot-TV** (the `spot-client` web app, loaded from a remote URL into an Electron `BrowserWindow`) and bolt on OS-level capabilities a browser can't provide: system volume control, online/offline detection, kiosk mode, crash recovery, and silent auto-update. It is a **plain Node/CommonJS** project — there is no React, no webpack, and no bundling step. `main.js` runs in the Electron main process; the actual Spot-TV UI runs in the renderer.

## Commands

Run from inside the `spot-electron/` directory (`nvm use` first; see root `CLAUDE.md`).

```bash
npm install                # also runs postinstall -> patch-package (applies patches/)
npm start                  # electron . — launches the app against defaultSpotURL
npm test                   # jest . — runs *.test.js
npm run lint               # eslint . --max-warnings 0 (fails on any warning)
npm run lint:fix           # eslint --fix
npm run dist               # electron-builder — produces installers in dist/
```

Single test (no dedicated script — use `npx`):

```bash
npx jest src/online-detector/OnlineDetector.test.js   # one file
npx jest -t "online status"                            # by test name
```

Runtime flags handled in source (pass after `npm start -- ...` or to the built binary):
- `--show-devtools` — force-open devtools (auto-on in dev via `electron-debug`).
- `--no-kiosk` / `--force-kiosk` — override kiosk mode (kiosk is on by default in production, off in dev). See `src/application-window/applicationwindow.js`.

Dev configuration is read from a `.env` file via `dotenv`, but **only when `electron-is-dev` is true** (see `main.js:1`). The most relevant var is `SPOT_URL` (overrides the default `https://spot.jitsi.net/tv`). `dist`/notarization/signing also read env vars (see Build/signing below).

## Architecture

### Startup flow (`main.js`)
`main.js` is the main-process entry (`"main"` in `package.json`). It does not build any UI itself — it just `require`s each feature module for its side effects, then creates the window on `app` ready:
1. Loads `.env` (dev only), configures login-at-startup and devtools.
2. `require('./src/spot-client-log-transport')` **first** so electron-side logs are captured even before the renderer can receive them.
3. `require`s `application-menu`, `auto-updater`, `client-control`, `exit`, `volume-control` — each module is a singleton that wires up its own listeners at import time.
4. `app.on('ready', createApplicationWindow)` builds the `BrowserWindow`.

Note the modules imported for side effects are **not** all the modules under `src/` — `application-window`, `online-detector`, `logger`, `config`, and `utils` are pulled in transitively by the ones listed above.

### The window and the Spot-TV iframe (`src/application-window/`)
`createApplicationWindow()` builds the single `BrowserWindow` (with `nodeIntegration: true` / `contextIsolation: false`, which is why renderer ↔ main IPC works directly) and `loadURL(defaultSpotURL)` — that URL is the hosted Spot-TV web app. This module is the glue between several features:
- Owns an `OnlineDetector`; on connectivity loss it swaps the window to `src/static/offline.html`, and on restore reloads the Spot-TV URL.
- On `render-process-gone` / `did-fail-load` (only while believed online) it shows `src/static/crashed.html` for 5s, then reloads the Spot-TV URL — automatic crash recovery for an unattended TV.
- Listens to `clientController`'s `meetingStatus` to pause the online detector during a meeting (so connectivity polling doesn't disrupt the call) and re-arm it afterward.
- Forwards renderer `console-message` events into the rotating file log via `fileLogger`.
- Calls `setKiosk()` near the end of `createApplicationWindow` rather than via `BrowserWindow` options (intentional — see the inline comment about a Big Sur iframe-API bug). Kiosk is on by default in production, off in dev, and overridable with `--no-kiosk` / `--force-kiosk`.

### Renderer ↔ main IPC bridge (`src/client-control/`)
`client-controller.js` exports a **singleton `ClientController`** (an `EventEmitter`) that is the contract between the Spot-TV web app and the native shell:
- Renderer → main: the Spot-TV sends `ipcMain` `'native-command'` messages `{ command, args }`; `ClientController` re-emits `command` as an event. Other features subscribe by command name — e.g. `volume-control` listens for `'adjustVolume'`, `exit` for `'exitApp'`, `auto-updater` for `'spot-electron/auto-updater'`.
- main → renderer: the Spot-TV emits `'spot-client/ready'` to register its `event.sender`; `ClientController.sendClientMessage(channel, ...)` then sends back to that renderer. It tracks `crashed`/`destroyed` to clear the reference and emits `CAN_SEND_MSG_EVENT` (`src/client-control/events.js`) when sendability changes.

So adding a native feature triggered by the TV = listen for a new command on `clientController`; sending data back to the TV = call `clientController.sendClientMessage(...)`.

### Logging (two layers)
- `src/logger/logger.js` — wraps `@jitsi/logger` (`getLogger('spot-electron')`); the standard logger all electron modules use.
- `src/logger/fileLogger.js` — wraps `electron-log`, writing to `<userData logs>/spot-console.log` (20 MB cap) with a `node-schedule` cron (`0 6 * * *`) that archives/rotates the file daily. Used for renderer console output.
- `src/spot-client-log-transport/` — registered as a **global transport on `@jitsi/logger`** (`index.js`), so every electron-side `logger` call is tunneled **into the Spot-TV's own logging pipeline** over the `spot-electron-logs` IPC channel. Logs emitted before the renderer is ready are buffered (cache size 1000) and flushed on `CAN_SEND_MSG_EVENT`. This is why the transport is required first in `main.js`.

### Other feature modules
- `src/volume-control/` — `clientController` `'adjustVolume'` ({direction: up/down}) steps volume ±5. Platform-dispatched: macOS via `node-osascript` (`_getDarwinVolume`/`_setDarwinVolume`), Windows via the optional `win-audio` native dep (`_getWin32Volume`/`_setWin32Volume`). Method names are derived from `os.platform()`, so unsupported platforms simply reject.
- `src/auto-updater/` — wraps `electron-updater`'s `autoUpdater`, forwarding its logs to the spot logger. Checks for updates on `app` ready (skipped in dev). The Spot-TV gates updates by sending `'spot-electron/auto-updater'` `{ updateAllowed }`; the controller downloads and calls `quitAndInstall(silent, forceRunAfterInstall)` only when allowed.
- `src/exit/` — on `'exitApp'` command, `app.quit()` with a 5s `app.exit(0)` fallback.
- `src/online-detector/` — `OnlineDetector` `EventEmitter` polling `is-online` every 10s (configurable), emitting `ONLINE_STATUS_CHANGED`. The one module with a unit test.
- `src/application-menu/` — builds a minimal menu (devtools + quit) only in dev; production has no app menu.
- `src/config/config.js` — singleton `Config` persisting JSON to `<userData>/config.json` (throttled writes), layered over defaults from the root `config.js` (`defaultSpotURL`). Note: distinct from the renderer Spot-TV's own config.
- `src/utils/stringutils.js` — `joinCodeToVersion` helper.

## Conventions

- **CommonJS, not ES modules.** Everything is `require`/`module.exports`. Modules use **relative imports** (`../logger`, `../../config`) — there is no absolute-import resolver like `spot-client` has.
- **Side-effect singletons.** Most `src/` features export a single already-instantiated object and register their listeners at module-load time; importing the module *is* the activation. Each feature dir has an `index.js` re-exporting the implementation file.
- **Tests are colocated** as `*.test.js` (jest `testMatch: ['**/*.test.js']`). Only `OnlineDetector.test.js` exists today; it uses `jest.mock`, fake timers, and overrides the static `OnlineDetector._isOnline`. `node_modules` is not transformed (`transformIgnorePatterns`). Babel is `@babel/preset-env` only (`babel.config.js`); jest needs it to transform the source.
- **Lint is strict:** `@jitsi/eslint-config` with `--max-warnings 0`; JSDoc on functions/methods is expected (matching the rest of the monorepo). `.eslintignore` excludes `dist` and `node_modules`.
- **Native deps & patches:**
  - `win-audio` is an `optionalDependency` (Windows-only); guard any new use behind a platform check as `volume-control` does, since it won't install on macOS/Linux.
  - `patches/@electron+notarize+2.4.0.patch` is applied by `patch-package` on `postinstall`. To change a third-party package, edit it in `node_modules` then `npx patch-package <name>` and commit the new patch — do not hand-edit files under `patches/`.
  - Spot-Electron relies on **native libraries built separately** per platform (e.g. `winrt-libs`); see the root repo `README.md` for build instructions for those modules.

## Build / packaging (`package.json` `build`, electron-builder)
- `npm run dist` runs `electron-builder` with `appId` `org.jitsi.spot`, productName `Spot`.
- **macOS:** universal `dmg` + `zip`, hardened runtime, `entitlements.mac.plist` (camera/mic/bluetooth). Notarization runs in `afterSign` via `scripts/notarize.js`, but **only if** `NOTARIZE_TEAM_ID`, `NOTARIZE_APPLE_ID`, and `NOTARIZE_APPLE_ID_PASSWORD` env vars are set (otherwise skipped).
- **Windows:** custom signer `scripts/winSign.js` shelling out to `smctl sign`, gated on the `CODE_SIGNER_KEYPAIR_ALIAS` env var (skipped if unset).
- **Publish/auto-update:** `publish.provider: github` with `publishAutoUpdate: true`, which is what `electron-updater` consumes at runtime.
