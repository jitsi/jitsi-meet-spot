#!/bin/bash
set -e

cd spot-client
npm install
npm run lint
npm run test
npm run build:prod

cd ../in-room-controller
npm install
npm run lint

cd ../spot-webdriver
npm install
npm run lint

pid=""

# if [ -z "$TEST_SERVER_URL" ]; then
    # port=TEST_PORT
    # export TEST_SERVER_URL="http://localhost:$TEST_PORT"

    # python -m SimpleHTTPServer $TEST_PORT &
    # pid=$!

    # sleep 1

    # ps aux | grep "$pid" | grep -v "grep"
    # [ $? -eq 0 ] || exit $?;
# fi

# npm run start

# kill $pid
