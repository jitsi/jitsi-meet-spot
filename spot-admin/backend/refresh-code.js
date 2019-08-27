const { send400Error, send401Error, send500Error, sendJSON } = require('./utils');

const refreshCodeFailureRate = process.env.REFRESH_CODE_FAILURE_RATE;

console.info('refresh-code failure rate: ' + refreshCodeFailureRate);

const refreshCodeRejectRate = process.env.REFRESH_CODE_REJECT_RATE;

console.info('refresh-code reject rate: ' + refreshCodeRejectRate);

function refreshController(spots, req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        send400Error(res, '"refreshToken" is required');

        return;
    }

    if (refreshCodeFailureRate && Math.random() < refreshCodeFailureRate) {
        send500Error(res, "Randomly failed /regenerate");

        return;
    }

    let spotRoom = null;
    for (const spot of spots.values()) {
        if (spot.getAccessToken().refreshToken === refreshToken) {
            spotRoom = spot;
            break;
        }
    }

    // Note that there are no checks for roomName duplication
    if (!spotRoom) {
        send401Error(res, 'Invalid refresh token');

        return;
    }

    if (refreshCodeRejectRate && Math.random() < refreshCodeRejectRate) {
        send401Error(res, "Randomly denied /regenerate");

        return;
    }

    const jwtToken = spotRoom.regenerateAccessToken();

    const response = {
        accessToken: jwtToken.accessToken,
        emitted: jwtToken.emitted,
        expiresIn: jwtToken.expiresIn,
        tenant: spotRoom.tenant
    };

    sendJSON(res, response);
}

module.exports = refreshController;
