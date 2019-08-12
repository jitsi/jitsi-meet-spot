# Spot

The application is intended to be running on a TV within a physically-existing meeting room, and left running, so it can be used to join online meetings. Remote control functionality is available to interact with the TV. Shown inside the application is jitsi-meet via an iFrame.

## Getting Started

There are a few requirements before the application can be launched.
1. Have access to a computer that can build this application using node and npm; specific versions that are known to work should be listed in package.json.
1. Spot supports Google and Outlook client side flows and also a bring-your-own-server flow. For Google and Outlook, check `docs/creating_a_calendar_client.md` for more details on creating calendar integration applications. The application ids should be configured in spot. The bring-your-own-server flow is currently a work in progress. An example of the required APIs and interactions are in the `spot-admin` directory.
1. Clone this repository.
1. In the local clone, fill out the configuration for this project. The actual configuration file is at `src/config/index.js`. This config file overrides the default config values in `spot-client/src/common/app-state/config/default-config.js`.
1. Build the application by running `npm install` to download dependencies and `npm run build:prod` to create the javascript files for the application.
1. Host the `index.html` and javascript on a server that supports the client using the history api.


## Known limitations

- Remote control only works when joining meetings that are using the same XMPP services as those configured for this application.
- This TV side of Spot is being tested with Chrome only.

## Contributing

Contributions are definitely welcome! If reporting an issue or suggesting features, please do provide steps to reproduce and mention if the issue is consistently reproduceable. If contributing a pull request, the build scripts used for development should automatically be running to ensure (one day) tests are passing and styling is in compliance.

## Versioning

Currently there is no versioning as the app is in early alpha.
