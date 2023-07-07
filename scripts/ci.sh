#!/bin/bash
set -e

# A pid file is used in the project root to ensure cleanup of the dev server
# used for selenium testing in case there was a non-graceful exit that prevented
# a previous run of the script from performing cleanup.
WEBPACK_DEV_SERVER_PID_FILE=webpack_dev_server.pid

kill_webpack_dev_server_pid() {
    sh ./scripts/ci-clean-pid.sh $WEBPACK_DEV_SERVER_PID_FILE
}

kill_webpack_dev_server_pid

if [ -z $SKIP_BASIC_TESTS ]; then
  echo "Running basic tests"

  echo "Testing Spot-Controller"
  cd spot-controller
  npm install
  npm run lint

  echo "Testing Spot-Electron"
  cd ../spot-electron
  npm install
  npm run lint
  npm run test

  echo "Testing Spot-Client"
  cd ../spot-client
  npm install
  npm run lint
  npm run test
  npm run build:prod

  echo "Testing Spot-Webdriver"
  cd ../spot-webdriver
  npm install
  npm run lint
else
  cd spot-webdriver && npm i && cd ../spot-client && npm i
fi

if [ -z "$ENABLE_WEBDRIVER" ]; then
    echo "No TEST_SERVER_URL configured for webdriver tests. Skipping tests."
else
    echo "Running Spot-Webdriver selenium tests"

    echo "Enabling dev server"
    cd ../spot-client
    ./node_modules/.bin/webpack-dev-server &
    echo $! > "../$WEBPACK_DEV_SERVER_PID_FILE"

    # Currently webpack-dev-server is used to serve the static frontend. It needs
    # time to do an initial compile of the spot-client codebase. Otherwise the
    # initial spot-webdriver test will run and wait for the server to come up,
    # eating into its own run time.
    echo "Sleeping to give webpack-dev-server time to start"
    sleep 30
    echo "Completed giving webpack-dev-server time to start"

    echo "Starting webdriver"
    cd ../spot-webdriver
    npm start || webdriver_exit_code=$?
fi

cd ..

kill_webpack_dev_server_pid

echo "Completing ci script with exit code $webdriver_exit_code"

exit $webdriver_exit_code
