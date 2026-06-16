# Spot-Webdriver

These are standalone webdriver tests to run against a Spot instance.

## Setup
1. Install dependencies with `npm install`
1. Ensure the Spot deployment to test against is running
1. Set an environment variable `TEST_SERVER_URL` with the url of the Spot deployment. The default is localhost:8000.

## Additional setup for testing with backend integration
1. Pair a Spot-TV manually.
1. Open the DevTools console on the browser with Spot-TV.
1. Look in local storage for the backend registration. As of this writing, this can be obtained with `JSON.parse(localStorage.getItem('spot-backend-registration')).refreshToken`.
1. Set the environment variable `BACKEND_REFRESH_TOKEN` with the refresh token.

Specs that exercise the backend flow (`spot-tv-conflict`, `waiting-for-tv`, `adhoc-meeting`, the backend blocks of `spot-tv-reconnect`/`share-mode`) call `pending()` unless `BACKEND_REFRESH_TOKEN` is set, so they only run in backend mode.

## Running tests
1. Execute `npm run e2e` to run the tests against an already-running Spot deployment.

Running just one spec file use:
1. Execute `npx wdio run ./wdio.conf.ts --spec specs/join-code.spec.ts` to run only the join-code spec.

## Running the full CI flow locally

- `npm run ci` boots the spot-client dev server, waits for it, runs the suite in **open-source mode**, then tears the server down. This is what the `e2e` CI job does.
- `npm run ci:backend` additionally boots the [`spot-admin`](../spot-admin) mock backend and points spot-client at it (via the `PAIRING_SERVICE_URL` / `ROOM_KEEPER_SERVICE_URL` / `CALENDAR_SERVICE_URL` build-time env vars), then runs the suite in **backend mode**. It seeds spot-admin with a fixed `REFRESH_TOKEN` and hands the same value to the suite as `BACKEND_REFRESH_TOKEN`, so the backend-only specs run instead of pending. This is what the `e2e-backend` CI job does.