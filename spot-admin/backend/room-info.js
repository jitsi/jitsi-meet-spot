const { send401Error, send404Error, send500Error, sendJSON } = require('./utils');

const roomInfoFailureRate = process.env.ROOM_INFO_FAILURE_RATE;

console.info('room-info failure rate: ' + roomInfoFailureRate);

function roomInfoController(spots, req, res){
    const authorization = req.headers['authorization'];

    if (authorization.indexOf('Bearer ') !== 0) {
        console.info(`Invalid token, "Authorization" header = ${authorization}`);
        send401Error(res, `Invalid token`);

        return;
    }

    const jwt = authorization.substring(7);

    if (roomInfoFailureRate && Math.random() < roomInfoFailureRate) {
        send500Error(res, "Randomly failed /room-info");

        return;
    }

    let spotRoom = null;

    // FIXME is there any better way to do this ? .filter/.find is any of this possible ?
    for (const room of spots.values()) {
        if (room.options.jwtToken.accessToken === jwt
                || room.options.shortLivedToken.accessToken === jwt) {
            spotRoom = room;
            break;
        }
    }

    if (!spotRoom) {
        send404Error(res, `No spot room found for jwt: ${jwt}`);

        return;
    }

    sendJSON(res, {
        id: spotRoom.id,
        mucUrl: spotRoom.options.mucUrl,
        name: spotRoom.options.name
    });
}

module.exports = roomInfoController;
