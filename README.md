# Jitsi-Meet-Spot

This is a web frontend application for integrating a Google calendar with jitsi-meetings. The application is intended to be running within a conference room, and left running, so it can be used to join conferences. Remote control functionality is available.

## Getting Started

There are a few requirements before the application can be launched.
1. Have access to a computer that can build this application using node and npm; specific versions that are known to work should be listed in package.json.
1. Have a Google client application that can be used for calendar syncing. Check `docs/creating_a_calendar_client.md` for more details.
1. Clone this repository.
1. In the local clone, fill out the configuration for this project. The actual configuration file is at `src/config/index.js`. and its values can be filled by creating a `.env` file in the project root and defining the configuration variables within the newly created file.
1. Build the application by running `npm install` to download dependencies and `npm run build-prod` to create the javascript file for the application.
1. Host the `index.html` and javascript on a server. For example use `python -m SimpleHTTPServer`.

## Development

Run `npm run start:dev` to launch webpack-dev-server. The server is configured to run on `http://localhost:8000`.

## Known limitations

- Remote control only works when joining conferences that are using the same XMPP services as those configured for this application.
- This application is currently developing against latest chrome only.

## Contributing

Contributions are definitely welcome! If reporting an issue or suggesting features, please do provide steps to reproduce and mention if the issue is consistently reproduceable. If contributing a pull request, the build scripts used for development should automatically be running to ensure (one day) tests are passing and styling is in compliance.

## Versioning

Currently there is no versioning as the app is in early alpha.
