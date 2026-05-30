import cors from 'cors';
import express, { type Express } from 'express';

import { calendarRequestController } from './backend/calendar.js';
import { registerDeviceController } from './backend/pair-device.js';
import { refreshController } from './backend/refresh-code.js';
import { remotePairingCodeController } from './backend/remote-pairing-code.js';
import { roomInfoController } from './backend/room-info.js';
import type { Spots } from './model/spot-room.js';

/**
 * Builds the Express application and wires every mock-backend route to the
 * supplied collection of rooms. Intentionally does not call `listen()` so the
 * app can be exercised directly by tests (e.g. supertest).
 *
 * @param spots - The collection of mock rooms the controllers operate on.
 * @returns The configured Express application.
 */
export function createApp(spots: Spots): Express {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.put('/pair', (req, res) => registerDeviceController(spots, req, res));
    app.post('/pair/code', (req, res) => remotePairingCodeController(spots, req, res));
    app.put('/pair/regenerate', (req, res) => refreshController(spots, req, res));
    app.get('/room/info', (req, res) => roomInfoController(spots, req, res));
    app.get('/calendar', (req, res) => calendarRequestController(spots, req, res));

    return app;
}
