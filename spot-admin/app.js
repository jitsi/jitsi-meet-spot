require('dotenv').config();

const calendarRequestHandler = require('./backend/calendar');
const registerDeviceHandler = require('./backend/register-device');
const roomInfoHandler = require('./backend/room-info');

const express = require('express');
const app = express();
const port = 8001;

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const spots = new Map();

app.post('/register-device', registerDeviceHandler.bind(null, spots));
app.get('/room-info', roomInfoHandler.bind(null, spots));
app.get('/calendar', calendarRequestHandler);

app.listen(port, () => console.log(`Spot-admin app listening on port ${port}!`));
