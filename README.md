# Jitsi-Meet Spot

This is the mono-repo for jitsi meet's room integration, named Spot.

in-room-controller/ contains the iPad client to be used as a permanent in-room remote.
spot-client/ contains the Spot code plus its remote control
spot-webdriver/ contains selenium webdriver tests for spot-client


## Known limitations

- Remote control only works when joining meetings that are using the same XMPP services as those configured for this application.
- This application is currently developing against latest chrome only.

## Contributing

Contributions are definitely welcome! If reporting an issue or suggesting features, please do provide steps to reproduce and mention if the issue is consistently reproduceable. If contributing a pull request, the build scripts used for development should automatically be running to ensure (one day) tests are passing and styling is in compliance.


## Versioning

Currently there is no versioning as the app is in early alpha.

## Docker

To do a docker build, be in the root directory /
Decide on the next tag name, current tags are 0.0.1, 0.0.2, etc.
Then run:
```scripts/docker-build <TAG>```

This will build and push a new image
