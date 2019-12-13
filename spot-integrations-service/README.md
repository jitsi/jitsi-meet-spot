# Spot Integrations Service

A backend service for signing Zoom meeting numbers with an api secret and api key.

## Getting Started
1. `npm install`
1. `npm start`

## Building
1. Generate an image name. Can use the example script in the monorepo: `./../scripts/get-spot-client-build-tag.sh`
1. `./scripts/build.sh IMAGE_NAME`. Note that the created image name will include the docker repo.
1. Run the image to test. For example: `docker run -p 3789:3789 -p 2112:2112 -e API_PORT=3789 -e METRICS_PORT=2112 -e ZOOM_API_SECRET=API_SECRET DOCKER_REPO:IMAGE_NAME -e ASAP_KEY_SERVER=http://someurl -e ZOOM_JWT_CONFIG='{"audiences":["jitsi-meet-spot"],"issuers":["spot-prod"]}'`

## Required environment variables:
- API_PORT: server port on which the main integrations application should be accessible
- ASAP_KEY_SERVER: server from which to retrieve a private key to validate JWTs
- METRICS_PORT: the server port on which prometheus metrics should be accessible
- ZOOM_API_SECRET: api secret provided by Zoom for signing meeting numbers
- ZOOM_JWT_CONFIG: a stringified javascript object with keys as JWT attributes and values as whitelists for what values JWTs can have. For example: `'{"audiences":["jitsi-meet-spot"],"issuers":["spot-prod"]}'`
