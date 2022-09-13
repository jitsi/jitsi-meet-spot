# Spot

The application is intended to be running on a TV within a physically-existing meeting room, and left running, so it can be used to join online meetings. Remote control functionality is available to interact with the TV. Shown inside the application is jitsi-meet via an iFrame.

## Note about open source versus backend mode
By default, Spot works without any other service. This is done by using random MUC names for Spot-Remotes to pair with Spot-TVs. However, Spot also supports integration with a custom backend server which can provide calendar information as well as JWTs for more secure MUCs. An example of the required APIs and interactions are in the `spot-admin` project. The way Spot determines which mode to run in is the presence of certain config values.

## Getting Started with open source mode
There are a few requirements before the application can be launched.
1. Have access to a computer that can build this application using node and npm; specific versions that are known to work should be listed in package.json.
1. Spot supports calendar integration via a bring-your-own-server flow.
1. Clone this repository.
1. In the local clone, fill out the configuration for this project. The configuration file is at `src/config/config.js`. This config file overrides the default config values in `spot-client/src/common/app-state/config/default-config.js`.
1. Build the application by running `npm install` to download dependencies and `npm run build:prod` to create the javascript files for the application.
1. Host the `index.html` and javascript on a server that supports the client using the history api. For local development, `npm run start:dev` can be used.

## Getting Started with backend mode
1. The backend server should be running and accessible. 
1. Have access to a computer that can build this application using node and npm; specific versions that are known to work should be listed in package.json.
1. Clone this repository.
1. In the local clone, fill out the configuration for this project. The configuration file is at src/config/config.js. This config file overrides the default config values in spot-client/src/common/app-state/config/default-config.js. The backend service needs SPOT_SERVICES and CALENDARS.BACKEND filled out with the proper overrides.
1. The remaining steps are the same as the open source flow.
## Known limitations

- Remote control only works when joining meetings that are using the same XMPP services as those configured for this application.
- This TV side of Spot is being tested with Chrome only.

## Contributing
Contributions are definitely welcome! If reporting an issue or suggesting features, please do provide steps to reproduce and mention if the issue is consistently reproduceable. If contributing a pull request, the build scripts used for development should automatically be running to ensure (one day) tests are passing and styling is in compliance.

## Releases
Releases are done through git tags. Release branches are created when a cherry-pick is necessary for a release, and a new git tag will be created. Spot supports the latest release only.
