# Spot-Webdriver

These are standalone webdriver tests to run against a Spot instance.

## Setup
1. Install dependencies with `npm install`
1. Ensure the Spot deployment to test against is running
1. Set an environment variable `TEST_SERVER_URL` with the url of the Spot deployment. The default is localhost:8000.

## Additional setup for testsing with backend integration
1. Pair a Spot-TV manually.
1. Open the DevTools console on the browser with Spot-TV.
1. Look in local storage for the backend registration. As of this writing, this can be obtained with `JSON.parse(localStorage.getItem('spot-backend-registration')).refreshToken`.
1. Set the environment variable `BACKEND_REFRESH_TOKEN` with the refresh token.

## Running tests
1. Execute `npm start` to run the tests

Running just one spec file use:
1. Execute `npx wdio run ./wdio.conf.js --spec specs/join-code.spec.js` to run only join-code spec