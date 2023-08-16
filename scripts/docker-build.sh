#!/bin/bash
TAG=$1

if [ -z "$TAG" ]; then
    echo "Usage: $0 <TAG>"
    exit 1
fi
DOCKER_REPO=103425057857.dkr.ecr.us-west-2.amazonaws.com/jitsi/spot-client

cd spot-client

docker build --build-arg SPOT_CLIENT_VERSION=$TAG -t $DOCKER_REPO:$TAG --platform linux/amd64 .

aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 103425057857.dkr.ecr.us-west-2.amazonaws.com
docker push $DOCKER_REPO:$TAG
