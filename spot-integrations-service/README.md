# Spot Integrations Service

A backend service for signing Zoom meeting numbers with an api secret and api key.

## Required environment variables:
- API_PORT (optional): server port on which the main integrations application should be accessible. Defaults to 3789.
- ASAP_KEY_SERVER (required): server from which to retrieve a private key to validate JWTs for requests.
- ENABLE_ALL_CORS (optional): whether or not to allow requests from any domain. Useful for local testing as browsers have CORS restrictions. Defaults to false.
- METRICS_PORT (optional): the server port on which prometheus metrics should be accessible. Defaults to 2112.
- ZOOM_API_SECRET (optional): The Zoom api client secret, passed in directly through an environment variable instead of fetching from AWS Secrets Manager. With this environment variable set, no request will be made to fetch from AWS Secrets Manager. This variable is to be used for local testing during development.
- ZOOM_AWS_SECRET_NAME (required): The name given to the secret in AWS Secrets Manager that holds the Zoom api client secret.
- ZOOM_AWS_SECRET_REGION (optional): The AWS region which holds the ZOOM_AWS_SECRET_NAME. Defaults to us-west-2.
- ZOOM_JWT_CONFIG (required): a stringified javascript object with keys as JWT attributes and values as whitelists for what values JWTs can have. For example: `'{"audiences":["jitsi-meet-spot"],"issuers":["spot-prod"]}'`

## Setting up external Zoom dependencies
The Zoom integration requires the use of AWS Secrets Manager as well as JWT verification.

1. Get a Zoom api secret by creating a Zoom application. Instructions are in `spot-client`.
1. Use AWS Secrets Manager to create a new secret. The secret key should be `ZOOM_API_SECRET` and the value should be the zoom client secret.
1. Use the environment variable name `ZOOM_AWS_SECRET_NAME` to point to the name of the created secret. Set the environment variable `ZOOM_AWS_SECRET_REGION` if needed. Whatever machine is running this service should have AWS authentication to retrieve the secret.
1. Set the environment variable `ASAP_KEY_SERVER` to the URL for the same key used by the spot client for its JWTs.
1. Set `ZOOM_JWT_CONFIG` to be an object with expected audiences and issuers in the JWT.

## Getting Started
1. `npm install`
1. Set up environment variables
1. `npm start`

## Building the docker image
1. Generate an image name. Can use the example script in the monorepo: `./../scripts/get-spot-client-build-tag.sh`
1. `./scripts/build.sh IMAGE_NAME`. Note that the created image name will include the docker repo and will be pushed.
1. Run the image locally to test. For example: `docker run -p 3789:3789 -p 2112:2112 -e ASAP_KEY_SERVER=http://someurl -e ZOOM_JWT_CONFIG='{"audiences":["jitsi-meet-spot"],"issuers":["spot-prod"]}' -e ZOOM_AWS_SECRET_NAME=somename DOCKER_REPO:IMAGE_NAME`
