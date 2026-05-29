# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`spot-admin` is a tiny Express server (`app.js`, single port **8001**) that **mocks the proprietary backend** Spot talks to in "backend mode". It is a developer/test convenience only — it is never deployed and is not used in open-source mode. Use it when you need `spot-client` to exercise the pairing-service / room-keeper / calendar code paths in `src/common/backend/` and `src/spot-tv/backend/` without a real backend.

State is entirely **in-memory** (a single `SpotRoom` held in a `Map`, recreated on every restart) — there is no database, no persistence, and tokens/codes are randomly generated strings, not real JWTs.

## Commands

Run from inside `spot-admin/`:

```bash
npm install
npm run start:dev          # nodemon app.js → listens on http://localhost:8001
```

`start:dev` is the **only** script. There is **no lint and no test** setup, and no `index.js` despite `"main": "index.js"` in package.json. The entry point is `app.js`.

Caveats when running:
- `nodemon` is not a declared dependency — `docs/getting-started.md` expects it installed globally (`npm i -g nodemon`). Alternatively just run `node app.js`.
- `app.js` does `require('body-parser')` but **body-parser is not listed in `package.json` dependencies** (it only resolves transitively via express in `package-lock.json`). `npm install` happens to provide it, but treat this as a latent fragility.

## Architecture

`app.js` is the whole wiring layer: it creates the Express app, enables `cors()`, parses JSON bodies, builds **one** `SpotRoom` (optionally seeded from env), stores it in a `spots` Map, and binds five route handlers — each is a controller from `backend/` partially applied with the `spots` Map via `.bind(null, spots)`.

### Routes (all on port 8001)

| Method & path | Controller (`backend/`) | Auth | Purpose |
|---|---|---|---|
| `PUT /pair` | `pair-device.js` (`registerDeviceController`) | none | Exchange a pairing `code` (long- or short-lived) for an access token. Body: `{ pairingCode, endpointId }`. |
| `POST /pair/code` | `remote-pairing-code.js` | `Bearer <accessToken>` | Mint a remote pairing code. `?pairingType=SHORT_LIVED` (default) or `LONG_LIVED`. |
| `PUT /pair/regenerate` | `refresh-code.js` | none (refresh token in body) | Refresh an access token. Body: `{ refreshToken }`. |
| `GET /room/info` | `room-info.js` | `Bearer <accessToken>` | Return `{ countryCode, id, mucUrl, name }` for the room matching the token. |
| `GET /calendar?tzid=...` | `calendar.js` | `Bearer <accessToken>` | Return `{ events: [...] }` — 11 synthetic "Meeting N" events with `meetingLink: https://meet.jit.si/meetingN`. `tzid` is required but not actually used. |

Routing matters: `/pair` maps to **register-device** semantics, and the short-lived (`SHORT_LIVED`) vs long-lived (`LONG_LIVED`) distinction recurs across pairing codes and access tokens — a Spot-Remote pairs with a short-lived code (no refresh token returned), a Spot-TV pairs with the long-lived code (gets a refresh token).

### The `SpotRoom` model (`model/spot-room.js`)

The single source of truth for one room. Each `SpotRoom` holds four credential structures, all with expiry helpers (`generateExpiresAndExpiresIn`) and lazy regeneration in their getters when `_expired`:
- `_accessToken` (`getAccessToken` / `regenerateAccessToken`) — long-lived access + refresh token pair.
- `_shortLivedToken` (`getShortLivedAccessToken`) — short-lived access token, no refresh token.
- `_pairingCode` (`getLongLivedPairingCode`) — long-lived pairing code; **seeded to the constant `'12345678'`** in the constructor (this is the LLPC a Spot-TV pairs with).
- `_remotePairingCode` (`getShortLivedPairingCode`) — short-lived pairing code (the SLPC a Spot-Remote pairs with).

Controllers identify the room by **linear scan** over `spots.values()` comparing the supplied code/token (see the `FIXME` comments — there's only ever one room, so this is fine). `toString()` logs all four credentials with the abbreviations **AT / RT / LLPC / SLPC / SLAT**, which is how you read codes off the console during the manual flow.

### Shared helpers (`backend/utils.js`)

`sendJSON`, `send400/401/404/500Error`, `generateRandomString`, and `generateExpiresAndExpiresIn`. All responses go through `sendJSON` (sets `type('json')`, appends a trailing newline).

### Configuration via environment (read in `app.js` and controllers)

`require('dotenv').config()` loads a `.env` in `spot-admin/`. Recognized vars:
- **Room seeding** (`app.js`): `JWT` (its decoded `spotRoomId` claim becomes the room id, else a random id is used), `JWT_SHORT_LIVED`, `TENANT`, `COUNTRY_CODE`.
- **Fault injection** (per-controller, a probability 0–1): `REG_DEVICE_FAILURE_RATE`, `REFRESH_CODE_FAILURE_RATE`, `REFRESH_CODE_REJECT_RATE`, `ROOM_INFO_FAILURE_RATE`, `CALENDAR_FAILURE_RATE`. When the random roll hits, the endpoint returns 500 (or 401 for the reject rate) so you can test client retry/error handling.

### How `spot-client` points at it

This server has no knowledge of the client. The client opts into backend mode by uncommenting the example block in its own `spot-client/config.js` (shipped commented out):
```js
SPOT_SERVICES: {
    pairingServiceUrl:    'http://localhost:8001/pair',
    roomKeeperServiceUrl: 'http://localhost:8001/room/info'
},
CALENDARS: { BACKEND: { SERVICE_URL: 'http://localhost:8001/calendar?tzid={tzid}' } }
```
`{tzid}` is substituted by the client with the Spot-TV machine's timezone. See `docs/getting-started.md` for the full end-to-end manual walkthrough (note: the `*_SERVICE_URL` env-var snippet in that doc describes the **client** config, not vars this server reads).

## Conventions

- Plain CommonJS (`require` / `module.exports`), Node, no build step, no transpilation, no TypeScript.
- Controllers follow one shape: `module.exports = function(spots, req, res) { ... }`, bound to `spots` in `app.js`. Add a new mock endpoint by writing `backend/<name>.js` in this shape and adding one `app.<verb>(path, controller.bind(null, spots))` line.
- Keep everything in-memory and stateless across restarts; this is a fake, so match real backend response **shapes** (see the JSDoc `@typedef CalendarEvent` atop `backend/calendar.js`) rather than building real auth.
