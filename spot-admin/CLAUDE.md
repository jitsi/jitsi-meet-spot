# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`spot-admin` is a tiny Express server (single port **8001**) that **mocks the proprietary backend** Spot talks to in "backend mode". It is a developer/test convenience only — it is never deployed and is not used in open-source mode. Use it when you need `spot-client` to exercise the pairing-service / room-keeper / calendar code paths in `src/common/backend/` and `src/spot-tv/backend/` without a real backend.

State is entirely **in-memory** (a single `SpotRoom` held in a `Map`, recreated on every restart) — there is no database, no persistence, and tokens/codes are randomly generated strings, not real JWTs.

It is written in **strict TypeScript** and is part of the repo's **npm-workspaces monorepo** (see the root `CLAUDE.md`).

## Commands

This is a workspace member, so install once from the **repository root** (`npm install` there installs spot-admin too). The scripts below are run from inside `spot-admin/` (or from the root with `npm run <script> --workspace spot-admin`):

```bash
npm run start:dev    # tsx watch src/server.ts → live-reloading dev server on http://localhost:8001
npm run build        # tsc -p tsconfig.build.json → compiles src/ to dist/ (tests excluded)
npm start            # node dist/server.js (run build first)
npm run typecheck    # tsc --noEmit -p tsconfig.json (strict; includes tests)
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm test             # cross-env NODE_OPTIONS=--experimental-vm-modules jest (ESM); unit + supertest tests
```

Single test: `npx jest src/app.test.ts` or `npx jest -t "calendar"`.

## Layout

```
src/
  server.ts            # entry point: seeds the room(s) from env, builds the app, listens on 8001
  app.ts               # createApp(spots): wires routes onto a fresh Express app (no listen → testable)
  types.ts             # shared interfaces (TokenStructure, PairingCodeStructure, CalendarEvent, ...)
  model/spot-room.ts   # the SpotRoom class + the `Spots` (Map) type
  backend/             # one controller per route + utils.ts (response/string helpers)
  *.test.ts            # colocated jest tests
```

The **app vs. server split is deliberate**: `app.ts` only builds and wires the Express app and never calls `listen()`, so `app.test.ts` can drive every route in-process with `supertest`. `server.ts` owns the side effects (reading `.env`, seeding the room, binding the port).

## Architecture

`createApp(spots)` (in `src/app.ts`) creates the Express app, enables `cors()`, parses JSON bodies with the **built-in `express.json()`** (Express 5 — the old `body-parser` dependency is gone), and binds five routes. Each controller is a **named export** taking `(spots, req, res)`; routes wrap it in an arrow that injects the shared `spots` map, e.g. `app.put('/pair', (req, res) => registerDeviceController(spots, req, res))`.

### Routes (all on port 8001)

| Method & path | Controller (`src/backend/`) | Auth | Purpose |
|---|---|---|---|
| `PUT /pair` | `pair-device.ts` (`registerDeviceController`) | none | Exchange a pairing `code` (long- or short-lived) for an access token. Body: `{ pairingCode, endpointId }`. |
| `POST /pair/code` | `remote-pairing-code.ts` (`remotePairingCodeController`) | `Bearer <accessToken>` | Mint a remote pairing code. `?pairingType=SHORT_LIVED` (default) or `LONG_LIVED`. |
| `PUT /pair/regenerate` | `refresh-code.ts` (`refreshController`) | none (refresh token in body) | Refresh an access token. Body: `{ refreshToken }`. |
| `GET /room/info` | `room-info.ts` (`roomInfoController`) | `Bearer <accessToken>` | Return `{ countryCode, id, mucUrl, name }` for the room matching the token. |
| `GET /calendar?tzid=...` | `calendar.ts` (`calendarRequestController`) | `Bearer <accessToken>` | Return `{ events: [...] }` — 11 synthetic "Meeting N" events with `meetingLink: https://meet.jit.si/meetingN`. `tzid` is required but not actually used. |

Routing matters: `/pair` maps to **register-device** semantics, and the short-lived (`SHORT_LIVED`) vs long-lived (`LONG_LIVED`) distinction recurs across pairing codes and access tokens — a Spot-Remote pairs with a short-lived code (no refresh token returned), a Spot-TV pairs with the long-lived code (gets a refresh token).

### The `SpotRoom` model (`src/model/spot-room.ts`)

The single source of truth for one room. Each `SpotRoom` holds four credential structures, all with expiry helpers (`generateExpiresAndExpiresIn`) and lazy regeneration in their getters when `_expired`:
- `_accessToken` (`getAccessToken` / `regenerateAccessToken`) — long-lived access + refresh token pair.
- `_shortLivedToken` (`getShortLivedAccessToken`) — short-lived access token, no refresh token.
- `_pairingCode` (`getLongLivedPairingCode`) — long-lived pairing code; **seeded to the constant `'12345678'`** in the constructor (this is the LLPC a Spot-TV pairs with).
- `_remotePairingCode` (`getShortLivedPairingCode`) — short-lived pairing code (the SLPC a Spot-Remote pairs with).

The private fields use definite-assignment (`!`) because they are populated by the generate/regenerate methods the constructor calls; the reads that can run before a field is set (in `regenerateAccessToken` and `toString`) use optional chaining. The `Spots = Map<string, SpotRoom>` type also lives here.

Controllers identify the room by **linear scan** over `spots.values()` comparing the supplied code/token (there's only ever one room, so this is fine). `toString()` logs all four credentials with the abbreviations **AT / RT / LLPC / SLPC / SLAT**, which is how you read codes off the console during the manual flow.

### Shared helpers (`src/backend/utils.ts`)

`sendJSON`, `send400/401/404/500Error` (all delegating to a private `sendError`), `generateRandomString`, and `generateExpiresAndExpiresIn`. All JSON responses go through `sendJSON` (sets `type('json')`, appends a trailing newline).

### Configuration via environment (read in `src/server.ts` and controllers)

`import 'dotenv/config'` (top of `server.ts`) loads a `.env` in `spot-admin/`. Recognized vars:
- **Room seeding** (`server.ts`): `JWT` (its decoded `spotRoomId` claim becomes the room id, else a random id is used — decoded with `jwt-decode` v4's named `jwtDecode` export), `JWT_SHORT_LIVED`, `TENANT`, `COUNTRY_CODE`.
- **Fault injection** (per-controller, a probability 0–1, parsed to a number): `REG_DEVICE_FAILURE_RATE`, `REFRESH_CODE_FAILURE_RATE`, `REFRESH_CODE_REJECT_RATE`, `ROOM_INFO_FAILURE_RATE`, `CALENDAR_FAILURE_RATE`. When the random roll hits, the endpoint returns 500 (or 401 for the reject rate) so you can test client retry/error handling.

### How `spot-client` points at it

This server has no knowledge of the client. The client opts into backend mode by uncommenting the example block in its own `spot-client/config.js` (shipped commented out):
```js
SPOT_SERVICES: {
    pairingServiceUrl:    'http://localhost:8001/pair',
    roomKeeperServiceUrl: 'http://localhost:8001/room/info'
},
CALENDARS: { BACKEND: { SERVICE_URL: 'http://localhost:8001/calendar?tzid={tzid}' } }
```
`{tzid}` is substituted by the client with the Spot-TV machine's timezone. See `docs/getting-started.md` for the full end-to-end manual walkthrough.

## Conventions

- **Strict TypeScript, native ESM (Node 24).** `tsconfig.json` extends the repo's `tsconfig.base.json` (strict, `noUnusedLocals`, etc.), targets `ES2023` and uses `module`/`moduleResolution: NodeNext`. The package is `"type": "module"`, so it compiles to **ESM that uses `import`, never `require`** — which means **relative imports must carry explicit `.js` extensions** (e.g. `import { sendJSON } from './utils.js'`, even from a `.ts` file). Use `import type` for type-only imports (`isolatedModules` is on).
- **Controller shape:** `export function <name>(spots: Spots, req: Request, res: Response): void`. Add a new mock endpoint by writing `src/backend/<name>.ts` in this shape and adding one `app.<verb>(path, (req, res) => <name>(spots, req, res))` line in `app.ts`.
- **Keep everything in-memory and stateless across restarts;** this is a fake, so match real backend response **shapes** (see the `CalendarEvent` interface in `types.ts`) rather than building real auth.
- **Tests** are colocated `*.test.ts` and run under **ESM jest** (`jest.config.mjs`: `ts-jest` with `useESM`, `extensionsToTreatAsEsm: ['.ts']`, and a `moduleNameMapper` that strips the `.js` from import specifiers back to `.ts`). Because jest runs as ESM, test files that need the mocking API must `import { jest } from '@jest/globals'` (the `describe`/`it`/`expect` globals still work ambiently). Unit tests cover `utils` and the `SpotRoom` model; `app.test.ts` drives every route with `supertest` against `createApp(...)`. `tsconfig.build.json` excludes `*.test.ts` from the build.
- **Logging:** this is a console-driven mock, so `no-console` is intentionally disabled in the eslint flat config (`eslint.config.mjs`).
