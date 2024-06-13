FROM node:20-alpine as builder
ARG SPOT_CLIENT_VERSION=dev

ADD . /build
WORKDIR /build
RUN \
    echo "Building version: ${SPOT_CLIENT_VERSION}" && \
    npm install && \
    npm run build:prod && \
    echo "{ \"spotClientVersion\": \"${SPOT_CLIENT_VERSION}\" }" > dist/spot-client-version.json

FROM nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html
COPY --from=builder /build/dist /usr/share/nginx/html/dist
