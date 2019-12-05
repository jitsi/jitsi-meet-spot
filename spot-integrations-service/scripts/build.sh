#!/bin/bash
set -u # or set -o nounset

#!/bin/bash
TAG=$1

if [ -z "$TAG" ]; then
    echo "Usage: $0 <TAG>"
    exit 1
fi

DOCKER_REPO=103425057857.dkr.ecr.us-west-2.amazonaws.com/jitsi/spot-integrations-service

$(aws ecr get-login --no-include-email)
docker build -t $DOCKER_REPO:$TAG .
docker push $DOCKER_REPO:$TAG
