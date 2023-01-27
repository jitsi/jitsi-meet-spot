1. Have `node`, `npm` and all that installed.

2. Install `nodemon` globally.

3. Got to `spot-admin` dir.

4. Add backend endpoints in your .env file (create it if does not exist in `spot-client/spot-admin` dir):
    ```json
        PAIRING_SERVICE_URL="http://localhost:8001/pair"
        ROOM_KEEPER_SERVICE_URL="http://localhost:8001/room/info"
        CALENDAR_SERVICE_URL="http://localhost:8001/calendar?tzid={tzid}"
    ```

The `{tzid}' part is replaced with the current timezone ID of the Spot TV machine.

5. Run the spot-admin app:

    `npm run start:dev`

6. Go to `spot-client` directory and set to `config.js` inside `JitsiMeetSpotConfig`:

    ```
       SPOT_SERVICES: {
        jwtDomains: [ 'stage.8x8.vc', 'dev.8x8.vc' ],
        pairingServiceUrl: 'http://localhost:8001/pair',
        roomKeeperServiceUrl: 'http://localhost:8001/room/info'
    },
    CALENDARS: { BACKEND: { SERVICE_URL: 'http://localhost:8001/calendar?tzid={tzid}' } }
    ```

7. Run the spot-client as usual, `npm run start:dev`.
It should try to use the backend for getting join codes and MUC room names.

8. Open remote control in a window tab, using: `localhost:8000`

9. From Terminal of spot-admin (`npm run start:dev`) take `SLPC` code (the code for joining in a room) and use it on remote tab (Step 8)

10. Open tv in another window tab, using `localhost:8000/tv`

11. Connect tv using the `LLPC` shown in Terminal of spot-admin and use it (Step 10)

12. Both remote and tv should be loaded with calendar having the following meetings: Meeting 1, Meeting 2, Meeting 3 (this are created from spot-admin backend)
    - https://github.com/jitsi/jitsi-meet-spot/blob/master/spot-admin/backend/calendar.js#L67

## Note:

- use Incognito window browser and from Step 8 ignore everything and just connect the TV window tab with `LLPC`
- once TV is connected, the remote window tab (incognito) will automatically be connected
    - or just use the link shown in TV, bellow the callendar in a new window tab (incognito).

## Testing Errors

You can make the backend randomly fail by creating `.env` file in the `spot-admin` dir and placing the following
properties:

```
CALENDAR_FAILURE_RATE=0.6
REG_DEVICE_FAILURE_RATE=0.7
ROOM_INFO_FAILURE_RATE=0.5
```
