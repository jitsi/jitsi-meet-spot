# Spot Integrations Service

A backend service for signing Zoom meeting numbers with an api secret and api key.

## Getting Started
1. `npm install`
1. `npm start`

## Building
1. `chmod +x ./scripts/build.sh`
1. `./scripts/build.sh IMAGE_NAME`
1. `docker run -p 3789:3789 -p 2112:2112 -e API_PORT=3789 -e METRICS_PORT=2112 -e ZOOM_API_SECRET=API_SECRET IMAGE_NAME`
