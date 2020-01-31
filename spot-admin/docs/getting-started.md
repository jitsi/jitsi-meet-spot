1. Have `node`, `npm` and all that installed.

1. Install `nodemon` globally.

1. Got to `spot-admin` dir.

1. Run the spot-admin app:

    `npm run start:dev` 

1. Go to `spot-client` dir

1. Add backend endpoints in your .env file:
    ```
    PAIRING_SERVICE_URL="http://localhost:8001/pair"
    ROOM_KEEPER_SERVICE_URL="http://localhost:8001/room/info"
    CALENDAR_SERVICE_URL="http://localhost:8001/calendar?tzid={tzid}"
    ```
    The `{tzid}' part is replaced with the current timezone ID of the Spot TV machine.

1. Run the spot-client as usual. It should try to use the backend for getting join codes and MUC room names.

## Testing Errors

You can make the backend randomly fail by creating `.env` file in the `spot-admin` dir and placing the following
properties:

```
CALENDAR_FAILURE_RATE=0.6
REG_DEVICE_FAILURE_RATE=0.7
ROOM_INFO_FAILURE_RATE=0.5
```
