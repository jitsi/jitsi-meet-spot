require('dotenv').config();

const calendarRequestController = require('./backend/calendar');
const registerDeviceController = require('./backend/register-device');
const roomInfoController = require('./backend/room-info');

const express = require('express');
const app = express();
const port = 8001;

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const spots = new Map();

app.post('/register-device', registerDeviceController.bind(null, spots));
app.get('/room-info', roomInfoController.bind(null, spots));
app.get('/calendar', calendarRequestController);

app.listen(port, () => console.log(`Spot-admin app listening on port ${port}!`));
