const { send401Error, send404Error, sendJSON } = require('./utils');

function remotePairingCodeController(spots, req, res){
    const authorization = req.headers['authorization'];

    if (authorization.indexOf('Bearer ') !== 0) {
        console.info(`Invalid token, "Authorization" header = ${authorization}`);
        send401Error(res, `Invalid token`);

        return;
    }

    const jwt = authorization.substring(7);

    let spotRoom = null;

    // FIXME is there any better way to do this ? .filter/.find is any of this possible ?
    for (const room of spots.values()) {
        if (room.options.jwtToken.accessToken === jwt) {
            spotRoom = room;
            break;
        }
    }

    if (!spotRoom) {
        send404Error(res, `No spot room found for the given JWT`);

        return;
    }

    const remotePairingCode = spotRoom.options.remotePairingCode;

    sendJSON(res, {
        code: remotePairingCode.code,
        emitted: new Date().toISOString(),
        expiresIn: remotePairingCode.expiresIn,
        pairingType: "SHORT_LIVED"
    });
}

module.exports = remotePairingCodeController;
