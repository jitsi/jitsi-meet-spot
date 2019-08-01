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

    let jwtToken = null;
    for (const spot of spots.values()) {
        if (spot.options.jwtToken.refreshToken === refreshToken) {
            jwtToken = spot.options.jwtToken;
        }
    }

    // Note that there are no checks for roomName duplication
    if (!jwtToken) {
        send401Error(res, 'Invalid refresh token');

        return;
    }

    if (refreshCodeRejectRate && Math.random() < refreshCodeRejectRate) {
        send401Error(res, "Randomly denied /regenerate");

        return;
    }

    const response = {
        accessToken: jwtToken.accessToken,
        emitted: Date.now(),
        expiresIn: jwtToken.expiresIn
    };

    sendJSON(res, response);
}

module.exports = refreshController;
