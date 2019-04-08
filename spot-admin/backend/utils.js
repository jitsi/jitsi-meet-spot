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

function send500Error(res, error) {
    res.status(500);
    res.statusMessage = error;
    res.end();
}

module.exports = {
    send400Error,
    send404Error,
    send500Error,
    sendJSON
};
