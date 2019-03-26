1. Have `node`, `npm` and all that installed.
2. Install and start a local instance of mongodb:

`https://docs.mongodb.com/manual/administration/install-community/`

3. Install 'nodemon' globally.

4. Got to `spot-admin` dir.

5. Run the app:

`npm run start:dev` 

Usage

A. To register a new room:

`./scripts/register-device.sh 1a2b3c`

The `1a2b3c` is the device ID that will identify the Spot-TV instance. This will allocate a new Spot room and return
the join code.

B. To retrieve the room info:

`./scripts/get-room-info.sh ABC456`

The `ABC456` is the Spot join code. The app should return a JSON which contains MUC room name needed for the Spot Remote
to connect to the Spot TV.
