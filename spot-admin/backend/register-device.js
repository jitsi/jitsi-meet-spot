const { send400Error, send500Error, sendJSON } = require('./utils');
const SpotRoom = require('../model/spot-room');

const registerDeviceFailureRate = process.env.REG_DEVICE_FAILURE_RATE;

console.info('register-device failure rate: ' + registerDeviceFailureRate);

const jwtToken = process.env.JWT_TOKEN;

function registerDeviceHandler(spots, req, res) {
    const { deviceId } = req.body;

    if (!deviceId) {
        send400Error(res, '"deviceId" is required');

        return;
    }

    if (registerDeviceFailureRate && Math.random() < registerDeviceFailureRate) {
        send500Error(res, "Randomly failed /register-device");

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

    const response = {
        deviceId,
        joinCode: spotRoom.options.joinCode
    };

    if (jwtToken) {
        response['jwt'] = jwtToken;
    }

    sendJSON(res, response);
}

module.exports = registerDeviceHandler;
