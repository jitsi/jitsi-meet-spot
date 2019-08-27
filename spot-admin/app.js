const { generateRandomString } = require('./backend/utils');

require('dotenv').config();

const jwtDecode = require('jwt-decode');
const calendarRequestController = require('./backend/calendar');
const pairDeviceController = require('./backend/pair-device');
const refreshController = require('./backend/refresh-code');
const remotePairingCodeController = require('./backend/remote-pairing-code');
const roomInfoController = require('./backend/room-info');

const SpotRoom = require('./model/spot-room');

const express = require('express');
const app = express();
const port = 8001;

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const spots = new Map();

// Try to decode room ID from the token
const jwt = process.env.JWT;
const jwtPayload = jwt && jwtDecode(jwt);
const roomIdFromJwt = jwtPayload && jwtPayload.spotRoomId;
const spot1Id = roomIdFromJwt ? roomIdFromJwt : `${generateRandomString()}_rooom1`;

console.info('Spot room id: ' + spot1Id);

const spot1 = new SpotRoom(spot1Id, {
    countryCode: process.env.COUNTRY_CODE,
    jwt,
    shortLivedJwt: process.env.JWT_SHORT_LIVED,
    tenant: process.env.TENANT
});

spots.set(spot1.id, spot1);

app.put('/pair', pairDeviceController.bind(null, spots));
app.post('/pair/code', remotePairingCodeController.bind(null, spots));
app.put('/pair/regenerate', refreshController.bind(null, spots));
app.get('/room/info', roomInfoController.bind(null, spots));
app.get('/calendar', calendarRequestController.bind(null, spots));

app.listen(port, () => console.log(`Spot-admin app listening on port ${port}!`));
