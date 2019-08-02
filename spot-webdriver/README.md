# Spot-Webdriver

These are standalone webdriver tests to run against a Spot instance.

## Setup
1. Install dependencies with `npm install`
1. Ensure the Spot deployment to test against is running
1. Set an environment variable TEST_SERVER_URL with the url of the Spot deployment. The default is localhost:8000.
1. If testing using backend integration, set the environment BACKEND_PAIRING_CODE to the long lived code the Spot-TV should use for pairing.
1. Execute `npm start` to run the tests
