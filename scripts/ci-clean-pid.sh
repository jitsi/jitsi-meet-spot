#!/bin/bash

echo "Attempting clean up of pid"

if test -f "$1"; then
    echo "pid file found"

    pkill -F $1 || true
    rm "$1"
else
    echo "No pid file to clean"
fi
