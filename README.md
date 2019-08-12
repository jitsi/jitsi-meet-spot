# Jitsi-Meet Spot

This is the mono-repo for Jitsi Meet's room integration, named Spot.

- spot-admin/ contains a mock server for testing integration between Spot and a backend service
- spot-client/ contains the Spot-TV and Spot-Remote codebase. This is the main application folder.
- spot-controller/ contains the iOS and Android application for the Spot-Remote. It shows the spot-client's remote in a webview.
- spot-electron/ contains the desktop application for displaying a Spot-TV in an iframe. It has additional functionality on top of what the spot-client can provide.
- spot-webdriver/ contains selenium webdriver tests for spot-client

## Known limitations

- Spot-Remotes and Spot-TVs only works together when they use the same server configuration
- Spot-TV currently supports latest Chrome only
- Spot-Remotes is full-featured in Chrome but also supports mobile browsers, Safari, Firefox.

## Contributing

Contributions are definitely welcome! If reporting an issue or suggesting features, please do provide steps to reproduce and mention if the issue is consistently reproduceable. If contributing a pull request, the build scripts used for development should automatically be running to ensure (one day) tests are passing and styling is in compliance.

## Docker

To do a docker build, be in the root directory /
Decide on the next tag name, current tags are 0.0.1, 0.0.2, etc.
Then run:
```scripts/docker-build <TAG>```

This will build and push a new image
