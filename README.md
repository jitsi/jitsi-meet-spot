 # Jitsi-Meet Spot

This is the mono-repo for Jitsi Meet's room integration, named Spot. This project is fairly independent of jitsi-meet (the web UI codebase) but it consumes Jitsi Meet through jitsi-meet's iFrame API.

- spot-admin/ contains a mock server for testing integration between Spot and a backend service
- spot-client/ contains the Spot-TV and Spot-Remote codebase. This is the main application folder.
- spot-controller/ contains the iOS and Android application for the Spot-Remote. It shows the spot-client in a webview.
- spot-electron/ contains the desktop application for displaying a Spot-TV in an iframe. It has additional functionality on top of what the spot-client can provide.
- spot-webdriver/ contains selenium webdriver tests for spot-client

# Spot SDKs
Some of Spot's code has been created outside of the mono repo.
- [Jitsi Spot SDK](https://github.com/jitsi/jitsi-spot-sdk) for react-native applications to show the Spot controller.
- [Spot Electron SDK](https://github.com/jitsi/spot-electron-sdk) for other electron applications communicate with the Spot-TV webview.

## Known limitations
- Spot-TV currently supports latest Chrome only
- Spot-Remotes are full-featured in Chrome but also supports reduced functionality in mobile browsers, Safari, and Firefox.

## Contributing

Contributions are definitely welcome! If reporting an issue or suggesting features, please do provide steps to reproduce and mention if the issue is consistently reproducible. If contributing a pull request, the build scripts used for development should automatically be running to ensure (one day) tests are passing and styling is in compliance.

## Docker

To do a docker build, be in the root directory /
Decide on the next tag name, current tags are 0.0.1, 0.0.2, etc.
Then run:
```scripts/docker-build <TAG>```

This will build and push a new image

## Notes

Spot Electron uses native libraries for various platforms. For up to date build instructions of those modules see the README of the appropriate modules (e.g. https://github.com/jitsi/winrt-libs/blob/master/README.md)
