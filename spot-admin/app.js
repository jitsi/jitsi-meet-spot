const express = require('express');
const app = express();
const port = 8001;

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const SpotRoom = require('./model/SpotRoom');

function sendJSON(response, object) {
    response.type('json');
    response.send(`${JSON.stringify(object)}\n`);
}

function send400Error(res, error) {
    res.status(400);
    res.statusMessage = error;
    res.end();
}

function send404Error(res, error) {
    res.status(404);
    res.statusMessage = error;
    res.end();
}

const spots = new Map();

app.post('/register-device', (req, res) => {
    const { deviceId } = req.body;

    if (!deviceId) {
        send400Error(res, '"deviceId" is required');

        return;
    }

    let spotRoom = spots.get(deviceId);

    // Note that there are no checks for roomName duplication
    if (!spotRoom) {
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const roomName = Math.random().toString(36).substring(2, 12);

        spotRoom = new SpotRoom(deviceId, { roomName, joinCode });
        spots.set(deviceId, spotRoom);

        console.info(`Registered new ${spotRoom}`);
    }

    sendJSON(res, {
        deviceId,
        joinCode: spotRoom.options.joinCode
    });
});

app.get('/room-info', (req, res) => {
    const { joinCode } = req.query;

    if (!joinCode) {
        send400Error(res, `Invalid join code: ${joinCode}`);

        return;
    }

    let spotRoom = null;

    // FIXME is there any better way to do this ? .filter/.find is any of this possible ?
    for (const room of spots.values()) {
        if (room.options.joinCode === joinCode.trim().toUpperCase()) {
            spotRoom = room;
            break;
        }
    }

    if (!spotRoom) {
        send404Error(res, `No spot room found for code: ${joinCode}`);

        return;
    }

    sendJSON(res, {
        roomName: spotRoom.options.roomName
    });
});

app.listen(port, () => console.log(`Spot-admin app listening on port ${port}!`));
