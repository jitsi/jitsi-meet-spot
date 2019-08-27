function sendJSON(response, object) {
    response.type('json');
    response.send(`${JSON.stringify(object)}\n`);
}

function send400Error(res, error) {
    res.status(400);
    res.statusMessage = error;
    res.end();
}

function send401Error(res, error) {
    res.status(401);
    res.statusMessage = error;
    res.end();
}

function send404Error(res, error) {
    res.status(404);
    res.statusMessage = error;
    res.end();
}

function send500Error(res, error) {
    res.status(500);
    res.statusMessage = error;
    res.end();
}

function generateRandomString(length = 13) {
    return Math.random().toString(36).substring(2, Math.max(Math.min(2 + length, 15), 3))
}

function generateExpiresAndExpiresIn(expiresIn) {
    const emitted = Date.now();

    return {
        emitted,
        expires: emitted + expiresIn,
        expiresIn
    };
};

module.exports = {
    generateExpiresAndExpiresIn,
    generateRandomString,
    send400Error,
    send401Error,
    send404Error,
    send500Error,
    sendJSON
};
