# Jitsi-Meet-Spot

A web frontend for integrating a google calendar with jitsi meetings. The intent is to run the frontend application within a room and leave it on.

## Getting Started

### Prerequisites

The application must be built first in order to run. A pre-requisite to building is having node and npm installed; specific versions that are known to work should be listed in package.json. Another prerequisite is filling out `src/config/index.js`. The file is left out intentionally so people can add their own configurations. Here is a sample:

```
export CLIENT_ID = 'id-here';
export XMPP_CONFIG = {
    bosh: 'bosh-url',
    hosts: {
        domain: 'host-url',
        muc: 'muc-url',
        focus: 'focus-url'
    }
}
```

The XMPP_CONFIG is what is expected by `lib-jitsi-meet` so please view that repository for more information.

### Installing

To build the frontend, run `npm install` to download dependencies and `npm run build-prod` to build the javascript bundle. Next serve `index.html` from a server, such as with `python -m SimpleHTTPServer`.

If developing, running `npm run watch-dev` to build the javascript will run webpack in watch mode to automatically rebundle on changes and also enable debug features.

## Contributing

Contributions are definitely welcome! If reporting an issue or suggesting features, please do provide steps to reproduce and mention if the issue is consistently reproduceable. If contributing a pull request, the build scripts used for development should automatically be running to ensure (one day) tests are passing and styling is in compliance.

## Versioning

Currently there is no versioning as the app is in early alpha.
