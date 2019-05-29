require('dotenv').config();

const calendarRequestController = require('./backend/calendar');
const pairDeviceController = require('./backend/pair-device');
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
const spot1Id = 'h7g394ytiohdf_rooom1';
const spot1 = new SpotRoom(spot1Id, {
    pairingCode: '123456',
    jwtToken: {
        accessToken: process.env.JWT,
        emitted: new Date().toISOString(),
        expiresIn: 60 * 60 * 1000,
        refreshToken: 'refreshsfj3049ublabla325something'
    },
    shortLivedToken: {
        accessToken: process.env.JWT_SHORT_LIVED,
        emitted: new Date().toISOString(),
        expiresIn: 10 * 60 * 1000
    },
    // It is unclear how the room name is to be retrieved yet. It might be part of the JWT.
    mucUrl: spot1Id,
    remotePairingCode: {
        code: '112233',
        emitted: new Date().toISOString(),
        expiresIn: 60 * 60 * 1000
    }
});

spots.set(spot1.id, spot1);

app.put('/pair', pairDeviceController.bind(null, spots));
app.post('/pair/code', remotePairingCodeController.bind(null, spots));
app.get('/room/info', roomInfoController.bind(null, spots));
app.get('/calendar', calendarRequestController);

app.listen(port, () => console.log(`Spot-admin app listening on port ${port}!`));
