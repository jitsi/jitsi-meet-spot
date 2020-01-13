# Zoom Integration

Spot-TV is able to display Zoom meetings while using the backend mode. Support is handled using the `@zoomus/websdk` library to join the meeting as a guest. Functionality while in the Zoom meeting is limited, as the zoom web sdk is generally intended for direct integration with the UI while Spot-TV is intended for indirect interaction through a Spot-Remote.

## Creating a Zoom client
Joining Zoom meetings through Spot requires a Zoom integration client.

1. Go to https://marketplace.zoom.us/.
2. Create a JWT application. There is no intent to publish the app.
3. Note the API key and API secret which are provided, as they will be used by Spot for the actual integration.

## Deploy the meeting sign service
For Zoom meetings to be joinable, Spot will need to sign the meeting number, per Zoom requirements. The folder `spot-integrations-service` provides a backend that can sign the meeting number.

## Configuring the client
1. Examine `default-config.js` for the expected configuration format for Spot to consume the API Key.
1. In `config.js`, add the override for the Zoom meeting integration. At the minumum add the API key and the signing service url.

A special note is that the API secret can also be added to the config, but should only be done for local convenience for local debugging, as the config is public and anyone can then access the secret.

## Joining a Zoom meeting
1. At the adhoc screen, enter the full url for a zoom meeting.
