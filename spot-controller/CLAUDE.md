# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`spot-controller` is the native React Native (**0.68, React 17 — both deliberately held**) iOS/Android app for the dedicated in-room Spot-Remote. It does not reimplement the remote UI: it loads the web Spot-Remote in a `react-native-webview` and layers native-only capabilities (keep-awake, a side menu, deployment switching, a JS<->native message bridge) around it. It is written in **strict TypeScript** (`.ts`/`.tsx`) and is an npm-workspaces member. Run the npm scripts from inside `spot-controller/` (or from the repo root with `--workspace spot-controller`).

## Commands

```bash
npm run lint        # eslint . (flat config)
npm run lint:fix    # eslint . --fix
npm run typecheck   # tsc --noEmit -p tsconfig.json (strict)
npm test            # jest (ts-jest) — unit tests for the React-Native-independent modules
```

Metro is the bundler (no `tsc` build step); type-checking is `npm run typecheck`. The RN-ecosystem deps are **held at their RN-0.68-compatible versions** (bumping them requires an RN upgrade, which is out of scope here).

**Testing scope:** jest + `ts-jest` run in a Node env (`tsconfig.spec.json`, CommonJS) and cover only the React-Native-**independent** logic (the `src/api` message bridge). Component rendering needs the native runtime / RN jest preset, which isn't available in this environment, so those aren't unit-tested here.

There is **no `start` script**. Running the app uses the React Native CLI directly (see `README.md`):

```
npm install                 # (jetify is no longer a postinstall — run it manually before an Android build if needed)
cd ios && pod install       # iOS only, then return to spot-controller/
react-native run-ios        # or run from Xcode (spot-controller.xcworkspace)
react-native run-android
```

`react-native run-*` starts the Metro bundler itself; there is no separate bundler script. The native iOS/Android build is **not verifiable in this sandbox** (needs Xcode/Android SDK).

## Architecture

Entry chain: `index.ts` registers the root component (`AppRegistry.registerComponent('spot-controller', () => App)`) -> `App.tsx`.

`App.tsx` is the router and the only stateful top-level component. On mount it reads the AsyncStorage key `remote-control-url` (constant `STORAGE_KEY_RC_URL`); if unset it falls back to `DEFAULT_URL = 'https://spot.8x8.vc'`. Its `render` returns a `Fragment` of:

- A `react-native-side-menu` (`SideMenu`) wrapping `RemoteControl` (`src/remote-control`, the WebView stack), with `src/settings-menu/SettingsMenu.js` as the drawer.
- `src/setup.js` (`Setup`) overlaid only when `state.showSetup` is true.

App-level actions:
- **Reset** (`_onResetApp`): closes the menu, calls `clearStorage()` down the WebView ref chain (which injects `localStorage.clear()`), removes the AsyncStorage URL key, then after a 1500ms timeout reloads or resets back to `DEFAULT_URL`.
- **Deployment** (`Setup`): validates an entered deployment URL by fetching `<url>/dist/config/config.js` and checking it contains `JitsiMeetSpotConfig` before persisting it via `_onSubmitEnteredUrl`.

WebView stack (`src/remote-control/`):
- `RemoteControl.js` owns the React Native `AppState` lifecycle. While the app is backgrounded it renders `LoadingScreen` instead of the WebView, and forwards `clearStorage()` / `reload()` to the inner ref only when active. Its `propTypes` are aliased straight from `SpotWebview.propTypes`.
- `SpotWebview.js` is the actual `react-native-webview`. Key behavior:
  - Resolves the URL first via a `HEAD` `fetch` to follow redirects (`_resolveUrl`), rendering `LoadingScreen` until resolved.
  - Builds a custom user agent: `SpotController/1` in `__DEV__`, otherwise appended with `AppInfo.name/version(buildNumber)` (see bridge below). The `SpotController/1` token exists for feature detection by the web side.
  - `originWhitelist` is locked to the resolved host so non-Spot links open in the device browser, not the WebView.
  - Injects `_preventWebViewZoomScript` to force a non-zoomable viewport, sets `cacheEnabled={false}`, and renders a Retry error screen on load failure.
  - Mounts `<KeepAwake />` (`react-native-keep-awake`) so the screen never sleeps.
  - Registers the WebView ref with the message-bridge singleton (`api.setReference(ref)`) and wires `onMessage={api._onMessage}`.

JS<->web bridge (`src/api/index.js`): a singleton `EventEmitter` (default export `api`).
- Web -> native: `_onMessage` parses `nativeEvent.data`, and for any payload with a `messageType` it re-emits `api.emit(messageType, messageData)`. Native code subscribes via `api.on(...)`.
- Native -> web: `_sendMessage(type, data)` calls `webViewRef.postMessage(JSON.stringify({ messageType, messageData }))`; `enterJoinCode()` is the one concrete helper, sending `connectWithCode`.

Native modules (consumed from JS as `NativeModules.AppInfo`): the `AppInfo` module exposes `name`/`version`/`buildNumber` constants, implemented in both `ios/spot-controller/AppInfo.m` (`RCT_EXPORT_MODULE`, reads `CFBundleDisplayName`/`CFBundleShortVersionString`/`CFBundleVersion`) and `android/.../org/jitsi/spot/AppInfoModule.java` (registered through `SpotControllerPackage.java`, added in `MainApplication.java`'s `getPackages()`).

Supporting modules:
- `src/logger/` re-exports a `jitsi-meet-logger` instance (`getLogger('jitsi-meet-spot-controller', ...)`).
- `src/icons/` — an `Icon` component that renders an imported SVG as a fill-colored icon.
- `src/styles.ts` — shared `StyleSheet.create` fragments (full-screen black background, centered content, webView flex).
- `src/LoadingScreen.tsx` — full-screen `ActivityIndicator`, used as the loading/background placeholder throughout.

The `android/` and `ios/` directories are full native projects (Gradle / CocoaPods + Xcode workspace, each with a `fastlane/` setup).

## Conventions

- **Strict TypeScript.** `tsconfig.json` extends the repo base with `module: ESNext` / `moduleResolution: Bundler` (metro bundles), `jsx: react-native`, `lib: ["ESNext", "DOM"]`, and `types: ["node", "react", "react-native", "jest"]`. **`noImplicitOverride` is turned off here** (React class components override lifecycle methods pervasively — this extra, non-strict-family flag would force `override` on every one); the core `strict` family stays on. Relative imports are **extensionless** (metro/bundler resolution).
- **Components** are class components typed as `React.Component<Props, State>` / `React.PureComponent<Props>`; `propTypes`/`prop-types` were replaced by **TypeScript prop interfaces** (e.g. `SpotWebviewProps`, reused by `RemoteControl`). Method handlers are `_`-prefixed and `.bind(this)` in the constructor. Refs use `React.createRef<T>()`.
- **Lint:** eslint flat config (`eslint.config.mjs`): `@eslint/js` + `typescript-eslint` recommended, with RN/jest globals. The React-specific eslint plugin is intentionally NOT used (its peer range doesn't yet cover eslint 10, and TS now covers prop typing).
- **Module layout:** feature folders (`remote-control/`, `settings-menu/`, `icons/`, `logger/`) each have an `index.ts` barrel that re-exports the implementation file; import from the folder, not the file.
- **SVG as components:** `metro.config.js` wires `react-native-svg-transformer` so `.svg` files under `assets/icons/` are imported as React components (`import refresh from '../../assets/icons/refresh.svg'`). The `*.svg` module is typed (`React.FC<SvgProps>`) in `declarations.d.ts`. `rn-cli.config.js` blacklists `android/`/`ios/`/`nodejs-assets/`. The Node tooling config files (`babel.config.js`, `metro.config.js`, `rn-cli.config.js`, `jest.config.js`) stay CommonJS `.js` as RN/metro expects.
- **Untyped deps** (`react-native-keep-awake`, the `jitsi-meet-logger` github dep) are declared in `declarations.d.ts`.
- **Native build quirks:** iOS requires `cd ios && pod install` before first build. `jetify` (Android AndroidX) is **no longer a `postinstall`** (it would scan the hoisted root `node_modules`); run it manually before an Android build if a dep needs it. The default deployment URL is hardcoded in `App.tsx` (`DEFAULT_URL`) — there is a `FIXME` to make it build-time configurable, so don't assume it is.
