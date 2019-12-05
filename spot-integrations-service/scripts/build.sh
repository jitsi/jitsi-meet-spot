#!/bin/bash
set -u # or set -o nounset

#!/bin/bash
TAG=$1

if [ -z "$TAG" ]; then
    echo "Usage: $0 <TAG>"
    exit 1
fi

docker build -t $TAG .
