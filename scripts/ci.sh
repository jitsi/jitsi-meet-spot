#!/bin/bash

pid=""

npm install
npm run lint
npm run test

if [ -z "$TEST_SERVER_URL" ]; then
    npm run build:prod

    port=TEST_PORT
    export TEST_SERVER_URL="http://localhost:$TEST_PORT"

    python -m SimpleHTTPServer $TEST_PORT &
    pid=$!

    sleep 1

    ps aux | grep "$pid" | grep -v "grep"
    [ $? -eq 0 ] || exit $?;
fi

npm run test:webdriver

kill $pid
