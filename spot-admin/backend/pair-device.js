const { send400Error, send500Error, sendJSON } = require('./utils');

const registerDeviceFailureRate = process.env.REG_DEVICE_FAILURE_RATE;

console.info('register-device failure rate: ' + registerDeviceFailureRate);

function registerDeviceController(spots, req, res) {
    const { pairingCode } = req.body;

    if (!pairingCode) {
        send400Error(res, '"pairingCode" is required');

        return;
    }

    if (registerDeviceFailureRate && Math.random() < registerDeviceFailureRate) {
        send500Error(res, "Randomly failed /register-device");

        return;
    }

    let shortLived = false;
    let spotRoom = null;
    for (const spot of spots.values()) {
        if (spot.options.pairingCode.code === pairingCode) {
            spotRoom = spot;
        }
    }

    // Note that there are no checks for roomName duplication
    if (!spotRoom) {
        // Try to match the remote pairing code
        for (const spot of spots.values()) {
            if (spot.options.remotePairingCode.code === pairingCode) {
                spotRoom = spot;
                shortLived = true;
            }
        }

        if (!spotRoom) {
            send400Error(res, 'Invalid paring code');

            return;
        }
    }

    const jwtStructure = shortLived ? spotRoom.options.shortLivedToken : spotRoom.options.jwtToken;

    const response = {
        accessToken: jwtStructure.accessToken,
        emitted: Date.now(),
        expiresIn: jwtStructure.expiresIn,
        id: spotRoom.id,
        refreshToken: shortLived ? undefined : jwtStructure.refreshToken,
        tenant: spotRoom.options.tenant
    };

    sendJSON(res, response);
}

module.exports = registerDeviceController;
