# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is a **monorepo** for Jitsi Meet's meeting-room integration ("Spot"). There is **no root `package.json`** — each subproject is independent, with its own dependencies, scripts, and a **`<subproject>/CLAUDE.md`** documenting it in detail. `cd` into a subproject before running its `npm` commands, and consult that subproject's CLAUDE.md for build/lint/test/run and internal architecture.

Node version is pinned in `.nvmrc` (currently 22); run `nvm use` and `npm install` per subproject.

## Subprojects

- **`spot-client/`** — the main app: one webpack bundle (React 17 + Redux) that runs as **Spot-TV** or **Spot-Remote** depending on the route. Start here for most work.
- **`spot-electron/`** — Electron desktop app that hosts a Spot-TV in an iframe and adds OS-level features (volume, auto-update, online detection).
- **`spot-controller/`** — React Native iOS/Android app that displays the web Spot-Remote in a WebView with extra native capability.
- **`spot-webdriver/`** — WebdriverIO + Jasmine E2E tests that drive spot-client in Chrome.
- **`spot-admin/`** — Express mock/reference backend for Spot's optional "backend mode" (pairing, room info, calendar, JWTs).
- **`spot-prosody/`** — Prosody (XMPP server) image + custom Lua plugins; the communication hub TVs and Remotes connect through.

## How it fits together

The product splits into two roles that never interact directly through a UI: a **Spot-TV** (left running on a screen in a meeting room) and one or more **Spot-Remotes** (phone/tablet/laptop used to control it). Both are served from the same `spot-client` bundle; the route decides the role. They communicate by joining a shared XMPP **MUC** on **Prosody** (`spot-prosody`) and exchanging presence/messages, with an optional **P2P** channel for low latency. The video conference itself is Jitsi Meet, embedded via its iframe API.

The native apps wrap these web roles: **spot-electron** hosts a Spot-TV (adding features unavailable to browsers), **spot-controller** hosts a Spot-Remote. **spot-webdriver** drives the web client end-to-end.

Spot runs in one of two modes, selected by the presence of certain config values (e.g. `SPOT_SERVICES`, `CALENDARS.BACKEND` in spot-client's config): **open-source mode** (self-hosted Prosody, random MUC names, no proprietary service) or **backend mode** (a service provides room info, JWTs, and calendars — `spot-admin` is the reference mock). See `spot-client/docs/glossary.md` for domain terms.

## Working across the repo

Each subproject is built, linted, and tested from its own directory (see its CLAUDE.md). `scripts/ci.sh` runs the full lint+test+build sweep across all of them, mirroring CI; the workflows in `.github/workflows/` run spot-client unit tests and the spot-webdriver E2E job on Linux.
