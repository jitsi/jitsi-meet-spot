1. Have `node`, `npm` and all that installed.
2. Install and start a local instance of mongodb:

    `https://docs.mongodb.com/manual/administration/install-community/`

3. Install 'nodemon' globally.

4. Got to `spot-admin` dir.

5. Run the spot-admin app:

    `npm run start:dev` 

6. Go to `spot-client` dir

7. Add backend endpoints in your .env file:

    ```
    ADMIN_SERVICE_URL="http://localhost:8001/register-device"
    JOIN_CODE_SERVICE_URL="http://localhost:8001/room-info"
    ```

8. Run the spot-client as usual. It should try to use the backend for getting join codes and MUC room names.

You can make the backend randomly fail by creating `.env` file in the `spot-admin` dir and placing the following
properties:

```
CALENDAR_FAILURE_RATE=0.6
REG_DEVICE_FAILURE_RATE=0.7
ROOM_INFO_FAILURE_RATE=0.5
```

Sending request to the backend with curl

A. To register a new room:

`./scripts/register-device.sh 1a2b3c`

The `1a2b3c` is the device ID that will identify the Spot-TV instance. This will allocate a new Spot room and return
the join code.

B. To retrieve the room info:

`./scripts/get-room-info.sh ABC456`

The `ABC456` is the Spot join code. The app should return a JSON which contains MUC room name needed for the Spot Remote
to connect to the Spot TV.

C. To get the list of calendar events:

`./scripts/calendar_events.sh`
