const { send400Error, send401Error, send404Error, sendJSON } = require('./utils');

const LONG_LIVED_PAIRING_TYPE = 'LONG_LIVED';
const SHORT_LIVED_PAIRING_TYPE = 'SHORT_LIVED';

function remotePairingCodeController(spots, req, res){
    const authorization = req.headers['authorization'];

    if (authorization.indexOf('Bearer ') !== 0) {
        console.info(`Invalid token, "Authorization" header = ${authorization}`);
        send401Error(res, `Invalid token`);

        return;
    }

    const jwt = authorization.substring(7);

    const pairingType = (req.query['pairingType'] ? req.query['pairingType'] : SHORT_LIVED_PAIRING_TYPE).toUpperCase();

    if (pairingType !== SHORT_LIVED_PAIRING_TYPE && pairingType !== LONG_LIVED_PAIRING_TYPE) {
        send400Error(res, 'Invalid pairing type');

        return;
    }

    let spotRoom = null;

    // FIXME is there any better way to do this ? .filter/.find is any of this possible ?
    for (const room of spots.values()) {
        if (room.getAccessToken().accessToken === jwt) {
            spotRoom = room;
            break;
        }
    }

    if (!spotRoom) {
        send401Error(res, `No spot room found for the given JWT: ${jwt}`);

        return;
    }

    const remotePairingCode
        = pairingType === SHORT_LIVED_PAIRING_TYPE
            ? spotRoom.generateShortLivedPairingCode()
            : spotRoom.generateLongLivedPairingCode();

    sendJSON(res, {
        code: remotePairingCode.code,
        emitted: remotePairingCode.emitted,
        expiresIn: remotePairingCode.expiresIn,
        pairingType
    });
}

module.exports = remotePairingCodeController;
