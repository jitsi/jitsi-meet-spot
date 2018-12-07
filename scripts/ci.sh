#!/bin/bash

pid=""

npm install
npm run lint
npm run test

if [ -z "$TEST_SERVER_URL" ]; then
    npm run build:prod

    export TEST_SERVER_URL="http://localhost:8000"

    npm run start:dev &
    pid=$!

    sleep 1

    ps aux | grep "$pid" | grep -v "grep"
    [ $? -eq 0 ] || exit $?;
fi

npm run test:webdriver

kill $pid
