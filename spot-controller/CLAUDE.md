# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`spot-controller` is the native React Native (0.68, React 17) iOS/Android app for the dedicated in-room Spot-Remote. It does not reimplement the remote UI: it loads the web Spot-Remote in a `react-native-webview` and layers native-only capabilities (keep-awake, a side menu, deployment switching, a JS<->native message bridge) around it. Run all commands below from inside `spot-controller/`.

## Commands

Only two npm scripts exist (`package.json`):

- `npm run lint` — runs `eslint .` over the whole subproject.
- `npm install` triggers `postinstall` -> `jetify` (the `jetifier` AndroidX migration step). You do not run `jetify` manually.

There is **no test script and no test runner** (no jest config, no `__tests__`, no `*.test.js`). Do not invent a test command.

There is also **no `start` script**. Running the app uses the React Native CLI directly (see `README.md`):

```
npm install                 # also runs jetify via postinstall
cd ios && pod install       # iOS only, then return to spot-controller/
react-native run-ios        # or run from Xcode (spot-controller.xcworkspace)
react-native run-android
```

`react-native run-*` starts the Metro bundler itself; there is no separate bundler script.

## Architecture

Entry chain: `index.js` registers the root component (`AppRegistry.registerComponent('spot-controller', () => App)`) -> `App.js`.

`App.js` is the router and the only stateful top-level component. On mount it reads the AsyncStorage key `remote-control-url` (constant `STORAGE_KEY_RC_URL`); if unset it falls back to `DEFAULT_URL = 'https://spot.8x8.vc'`. Its `render` returns a `Fragment` of:

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
- `src/styles.js` — shared StyleSheet fragments (full-screen black background, centered content, webView flex).
- `src/LoadingScreen.js` — full-screen `ActivityIndicator`, used as the loading/background placeholder throughout.

The `android/` and `ios/` directories are full native projects (Gradle / CocoaPods + Xcode workspace, each with a `fastlane/` setup).

## Conventions

- **Import style / lint:** ESLint config (`.eslintrc`) extends `eslint-config-jitsi` plus its `/jsdoc` and `/react` configs; only override is `jsdoc/check-tag-names: 0`. This enforces Jitsi's import ordering and **JSDoc on methods** — match the existing `@inheritdoc` / `@private` / `@returns` doc-block style on every class method when adding code. `react.version` is pinned to `16.8.2` in lint settings even though React 17 is installed.
- **Components** are mostly class components using static `propTypes` (via `prop-types`); follow that pattern rather than hooks. Method handlers are `_`-prefixed and `.bind(this)` in the constructor.
- **Module layout:** feature folders (`remote-control/`, `settings-menu/`, `icons/`, `logger/`) each have an `index.js` barrel that re-exports the implementation file; import from the folder, not the file.
- **SVG as components:** `metro.config.js` wires `react-native-svg-transformer` so `.svg` files under `assets/icons/` are imported as React components (`import refresh from '../../assets/icons/refresh.svg'`). `svg` is removed from `assetExts` and added to `sourceExts`. Note `rn-cli.config.js` also exists, blacklisting `android/`, `ios/`, and `nodejs-assets/` from the bundler.
- **Babel:** `babel.config.js` uses `metro-react-native-babel-preset` with `unstable_disableES6Transforms: true`.
- **Native build quirks:** iOS requires `cd ios && pod install` before first build; `jetify` runs automatically on install for Android AndroidX compatibility. The default deployment URL is hardcoded in `App.js` (`DEFAULT_URL`) — there is a `FIXME` to make it build-time configurable, so don't assume it is.
