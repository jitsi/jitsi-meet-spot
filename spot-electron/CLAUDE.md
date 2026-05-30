# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`spot-electron` is an Electron desktop app whose only job is to host a **Spot-TV** (the `spot-client` web app, loaded from a remote URL into an Electron `BrowserWindow`) and bolt on OS-level capabilities a browser can't provide: system volume control, online/offline detection, kiosk mode, crash recovery, and silent auto-update. `main.ts` runs in the Electron main process; the actual Spot-TV UI runs in the renderer.

It is written in **strict TypeScript** and is **native ESM** (`"type": "module"` — `import`, never `require`). There is no webpack/bundling, but there **is** a compile step: `tsc` compiles `src/**/*.ts` to `dist/`, and Electron runs the compiled `dist/main.js`. It is part of the repo's npm-workspaces monorepo (see the root `CLAUDE.md`).

## Commands

Install once from the **repository root** (`npm install` installs this workspace too). The scripts below run from inside `spot-electron/` (or from root with `npm run <script> --workspace spot-electron`):

```bash
npm run build              # tsc -p tsconfig.build.json -> compiles src/ to dist/ (tests excluded)
npm start                  # npm run build && electron .  -> builds, then launches against defaultSpotURL
npm run dist               # npm run build && electron-builder -> installers in release/ (packaging)
npm test                   # cross-env NODE_OPTIONS=--experimental-vm-modules jest (ESM)
npm run typecheck          # tsc --noEmit -p tsconfig.json (strict; includes tests)
npm run lint               # eslint . (flat config, eslint.config.mjs)
npm run lint:fix           # eslint . --fix
```

Single test (no dedicated script — use `npx`):

```bash
cross-env NODE_OPTIONS=--experimental-vm-modules npx jest src/online-detector/OnlineDetector.test.ts
```

Runtime flags handled in source (pass after `npm start -- ...` or to the built binary):
- `--show-devtools` — force-open devtools (auto-on in dev via `electron-debug`).
- `--no-kiosk` / `--force-kiosk` — override kiosk mode (kiosk is on by default in production, off in dev). See `src/application-window/applicationwindow.ts`.

Dev configuration is read from a `.env` file via `dotenv`, but **only when `electron-is-dev` is true**. This load happens in `src/load-env.ts`, which `main.ts` imports **first** so the `.env` is applied before any module (e.g. `src/default-config.ts`) reads `process.env`. The most relevant var is `SPOT_URL` (overrides the default `https://spot.jitsi.net/tv`). `dist`/notarization/signing also read env vars (see Build/signing below).

## Architecture

### Startup flow (`src/main.ts` → `dist/main.js`)
`main.ts` is the main-process entry (`"main": "dist/main.js"` in `package.json`). It does not build any UI itself — it imports each feature module for its side effects, then creates the window on `app` ready:
1. `import './load-env.js'` **first** (loads `.env` in dev, synchronously, before anything reads `process.env`).
2. Imports `electron`, `electron-debug`, `electron-is-dev`; configures login-at-startup and devtools.
3. `import './spot-client-log-transport/index.js'` **early** so electron-side logs are captured even before the renderer can receive them, then `application-menu`, `auto-updater`, `client-control`, `exit`, `volume-control` — each module is a singleton that wires up its own listeners at import time.
4. `app.on('ready', createApplicationWindow)` builds the `BrowserWindow`.

Note the modules imported for side effects are **not** all the modules under `src/` — `application-window`, `online-detector`, `logger`, `config`, and `utils` are pulled in transitively by the ones listed above.

### The window and the Spot-TV iframe (`src/application-window/`)
`createApplicationWindow()` builds the single `BrowserWindow` (with `nodeIntegration: true` / `contextIsolation: false`, which is why renderer ↔ main IPC works directly) and `loadURL(defaultSpotURL)` — that URL is the hosted Spot-TV web app. This module is the glue between several features:
- Owns an `OnlineDetector`; on connectivity loss it swaps the window to `src/static/offline.html`, and on restore reloads the Spot-TV URL.
- On `render-process-gone` / `did-fail-load` (only while believed online) it shows `src/static/crashed.html` for 5s, then reloads the Spot-TV URL — automatic crash recovery for an unattended TV.
- Listens to `clientController`'s `meetingStatus` to pause the online detector during a meeting (so connectivity polling doesn't disrupt the call) and re-arm it afterward.
- Forwards renderer `console-message` events into the rotating file log via `fileLogger`. NOTE: in Electron 42 the `console-message` event delivers a single event object with a **string** `level` (`debug`/`info`/`warning`/`error`), which `fileLogger.logToFile` maps to an electron-log method.
- Calls `setKiosk()` near the end of `createApplicationWindow` rather than via `BrowserWindow` options (intentional — see the inline comment about a Big Sur iframe-API bug). Kiosk is on by default in production, off in dev, and overridable with `--no-kiosk` / `--force-kiosk`.

### Renderer ↔ main IPC bridge (`src/client-control/`)
`client-controller.ts` exports a **singleton `ClientController`** (an `EventEmitter`) that is the contract between the Spot-TV web app and the native shell:
- Renderer → main: the Spot-TV sends `ipcMain` `'native-command'` messages `{ command, args }`; `ClientController` re-emits `command` as an event. Other features subscribe by command name — e.g. `volume-control` listens for `'adjustVolume'`, `exit` for `'exitApp'`, `auto-updater` for `'spot-electron/auto-updater'`.
- main → renderer: the Spot-TV emits `'spot-client/ready'` to register its `event.sender`; `ClientController.sendClientMessage(channel, ...)` then sends back to that renderer. It tracks `render-process-gone`/`destroyed` to clear the reference and emits `CAN_SEND_MSG_EVENT` (`src/client-control/events.ts`) when sendability changes.

So adding a native feature triggered by the TV = listen for a new command on `clientController`; sending data back to the TV = call `clientController.sendClientMessage(...)`.

### Logging (two layers)
- `src/logger/logger.ts` — wraps `@jitsi/logger` (`getLogger('spot-electron')`); the standard logger all electron modules use. Exports a typed `Logger` interface plus the singleton.
- `src/logger/fileLogger.ts` — wraps `electron-log` (**v5**: imported from `electron-log/main`, uses `resolvePathFn`), writing to `<userData logs>/spot-console.log` (20 MB cap) with a `node-schedule` cron (`0 6 * * *`) that archives/rotates the file daily. Used for renderer console output.
- `src/spot-client-log-transport/` — registered as a **global transport on `@jitsi/logger`** (`index.ts`), so every electron-side `logger` call is tunneled **into the Spot-TV's own logging pipeline** over the `spot-electron-logs` IPC channel. Logs emitted before the renderer is ready are buffered (cache size 1000) and flushed on `CAN_SEND_MSG_EVENT`. This is why the transport is imported first in `main.ts`.

### Other feature modules
- `src/volume-control/` — `clientController` `'adjustVolume'` ({direction: up/down}) steps volume ±5. Platform-dispatched via a typed `switch` on `os.platform()`: macOS via `node-osascript`, Windows via the optional `win-audio` native dep (**dynamically `import()`-ed** only on win32, since it isn't installed on other platforms). Unsupported platforms reject.
- `src/auto-updater/` — wraps `electron-updater`'s `autoUpdater`, forwarding its logs to the spot logger. Checks for updates on `app` ready (skipped in dev). The Spot-TV gates updates by sending `'spot-electron/auto-updater'` `{ updateAllowed }`; the controller downloads and calls `quitAndInstall(silent, forceRunAfterInstall)` only when allowed.
- `src/exit/` — on `'exitApp'` command, `app.quit()` with a 5s `app.exit(0)` fallback.
- `src/online-detector/` — `OnlineDetector` `EventEmitter` polling `is-online` every 10s (configurable), emitting `ONLINE_STATUS_CHANGED`. The one module with rich unit tests (`OnlineDetector.test.ts`); tests stub the static `OnlineDetector._isOnline`.
- `src/application-menu/` — builds a minimal menu (devtools + quit) only in dev; production has no app menu.
- `src/config/config.ts` — singleton `Config` persisting JSON to `<userData>/config.json` (throttled writes), layered over defaults from `src/default-config.ts` (`defaultSpotURL`). Note: distinct from the renderer Spot-TV's own config.
- `src/utils/stringutils.ts` — `joinCodeToVersion` helper (unit-tested in `stringutils.test.ts`).

## Conventions

- **Native ESM + strict TypeScript.** `tsconfig.json` extends the repo's `tsconfig.base.json`, targets `ES2023` and uses `module`/`moduleResolution: NodeNext`. The package is `"type": "module"`, so **relative imports carry explicit `.js` extensions** even from `.ts` files (`import { logger } from '../logger/index.js'`). Use `import type` for type-only imports. The compiled `dist/` contains zero `require(` — `import` only.
- **Side-effect singletons.** Most `src/` features export a single already-instantiated object and register their listeners at module-load time; importing the module *is* the activation. Each feature dir has an `index.ts` re-exporting the implementation file.
- **Tests are colocated** as `*.test.ts` and run under **ESM jest** (`jest.config.mjs`: `ts-jest` with `useESM`, `extensionsToTreatAsEsm: ['.ts']`, plus a `moduleNameMapper` stripping the `.js` from import specifiers). Test files that use the mocking API `import { jest } from '@jest/globals'`. Only the electron-independent logic is unit-tested (`OnlineDetector`, `stringutils`) — modules that import `electron` need the Electron runtime. `tsconfig.build.json` excludes `*.test.ts` from the build.
- **Untyped deps** (`node-osascript`, optional `win-audio`) and the untyped `@jitsi/logger` are declared in `src/types/externals.d.ts`.
- **Lint is strict:** eslint flat config (`eslint.config.mjs`) with `@eslint/js` recommended + `typescript-eslint` recommended. `no-console` is intentionally off (main process + build scripts log directly).
- **Native deps:**
  - `win-audio` is an `optionalDependency` (Windows-only); guard any new use behind a platform check / dynamic import as `volume-control` does, since it won't install on macOS/Linux.
  - There is **no longer a patch-package step**: the old `patches/@electron+notarize+2.4.0.patch` (which made `codesign` use the full app path) is obsolete — `@electron/notarize` 3.x already resolves the app via `./<basename>` with `cwd: dirname`.
  - Spot-Electron relies on **native libraries built separately** per platform (e.g. `winrt-libs`); see the root repo `README.md` for build instructions for those modules.

## Build / packaging (`package.json` `build`, electron-builder)
- `npm run dist` runs `tsc` then `electron-builder` with `appId` `org.jitsi.spot`, productName `Spot`. The `files` glob packages `dist/**/*` and `src/static/**/*`; packaged installers are written to `release/` (`directories.output`) so they don't collide with the compiled `dist/`. The `afterSign`/`win.sign` hooks point at the **compiled** `dist/scripts/notarize.js` / `dist/scripts/winSign.js` (sources in `src/scripts/`).
- **macOS:** universal `dmg` + `zip`, hardened runtime, `entitlements.mac.plist` (camera/mic). Notarization runs in `afterSign` via `dist/scripts/notarize.js`, but **only if** `NOTARIZE_TEAM_ID`, `NOTARIZE_APPLE_ID`, and `NOTARIZE_APPLE_ID_PASSWORD` env vars are set (otherwise skipped).
- **Windows:** custom signer `dist/scripts/winSign.js` shelling out to `smctl sign`, gated on the `CODE_SIGNER_KEYPAIR_ALIAS` env var (skipped if unset).
- **Publish/auto-update:** `publish.provider: github` with `publishAutoUpdate: true`, which is what `electron-updater` consumes at runtime.
- **Not verifiable in a headless sandbox:** `electron .` (needs a display) and `npm run dist` (needs signing/native toolchains). CI builds these on macOS/Windows runners.
