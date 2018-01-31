# Jitsi-Meet-Spot

A web frontend for integrating a google calendar with jitsi meetings. The intent is to run the frontend application within a room and leave it on.

## Getting Started

### Prerequisites

The application must be built first in order to run. A pre-requisite to building is having node and npm installed; specific versions that are known to work should be listed in package.json. Another prerequisite is modifying `src/config/index.js`. The file is filled with defaults but should be customized as needed.

The XMPP_CONFIG in config is what is expected by `lib-jitsi-meet` so please view that repository for more information.

### Installing

To build the frontend, run `npm install` to download dependencies and `npm run build-prod` to build the javascript bundle. Next serve `index.html` from a server, such as with `python -m SimpleHTTPServer`.

If developing, running `npm run watch-dev` to build the javascript will run webpack in watch mode to automatically rebundle on changes and also enable debug features.

### Special note about ultrasound support

The app currently uses Quiet.js for ultrasound. The spot client can emit an ultra sound message for remote clients to be notified of the url to visit to remotely control the spot client. The Quiet.js files are currently in the top level of the project and should not be modified directly as they are third-party files.

## Contributing

Contributions are definitely welcome! If reporting an issue or suggesting features, please do provide steps to reproduce and mention if the issue is consistently reproduceable. If contributing a pull request, the build scripts used for development should automatically be running to ensure (one day) tests are passing and styling is in compliance.

## Versioning

Currently there is no versioning as the app is in early alpha.
