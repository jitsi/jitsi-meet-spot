const { send400Error, send404Error, send500Error, sendJSON } = require('./utils');

const roomInfoFailureRate = process.env.ROOM_INFO_FAILURE_RATE;

console.info('room-info failure rate: ' + roomInfoFailureRate);

function roomInfoController(spots, req, res){
    const { joinCode } = req.query;

    if (!joinCode) {
        send400Error(res, `Invalid join code: ${joinCode}`);

        return;
    }

    if (roomInfoFailureRate && Math.random() < roomInfoFailureRate) {
        send500Error(res, "Randomly failed /room-info");

        return;
    }

    let spotRoom = null;

    // FIXME is there any better way to do this ? .filter/.find is any of this possible ?
    for (const room of spots.values()) {
        if (room.options.joinCode === joinCode.trim()
            .toUpperCase()) {
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
}

module.exports = roomInfoController;
