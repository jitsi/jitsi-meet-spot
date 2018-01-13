# Jitsi-Meet-Spot

A frontend for integrating a google calendar with jitsi meetings. The intent is to run the frontend application within a room and leave it on.

## Getting Started

The project is built using npm for dependency management, webpack for bundling, and npm scripts for running builds. To build the frontend, run `npm install` to download dependencies and `npm run build-prod` to build the bundle. Next serve `index.html` from a server, such as with `python -m SimpleHTTPServer`.

If developing, running `npm run watch-dev` will run webpack in watch mode to automatically rebundle on changes and also enable debug features.

## Contributing

Contributions are definitely welcome! If reporting an issue or suggesting features, please do provide steps to reproduce and mention if the issue is consistently reproduceable. If contributing a pull request, the build scripts used for development should automatically be running to ensure (one day) tests are passing and styling is in compliance.

## Versioning

Currently there is no versioning as the app is in early alpha.
