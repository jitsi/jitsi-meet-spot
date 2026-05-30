import isDev from 'electron-is-dev';
import dotenv from 'dotenv';

// Load the dev `.env` synchronously, and before any module reads `process.env`
// (e.g. `default-config`). This module must be imported first from `main.ts`.
if (isDev) {
    dotenv.config();
}
