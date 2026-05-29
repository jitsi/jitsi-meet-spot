# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This subproject packages a [Prosody](https://prosody.im/) (XMPP server) deployment for Spot. Prosody is the communication hub: a Spot-TV and its Spot-Remotes join a shared XMPP **MUC** (multi-user conference) here and exchange presence/messages to drive the TV. There is **no `package.json`** and no npm workflow — this is a Dockerfile plus a handful of custom Lua plugins.

## Commands

Everything is Docker. From inside `spot-prosody/`:

```bash
docker build -t spot-prosody .          # build the image
```

The image is `jitsi/prosody:stable-8138` with the plugins in `config/prosody-plugins-custom/` layered on top. There is no test runner and no lint config in this subproject. There is no `docker-compose.yml` and no `.cfg.lua` here either — see Architecture for why.

## Architecture

### The image is "base image + plugins", not a full config

`Dockerfile` is two lines: it starts `FROM jitsi/prosody:stable-8138` and copies everything in `config/prosody-plugins-custom/` into `/prosody-plugins-custom/` (the directory the jitsi/prosody base image already adds to Prosody's plugin search path). The base image supplies the actual `prosody.cfg.lua`, virtual hosts, MUC component, ports (5222/5347/5280, etc.), and TLS — all generated at container start from environment variables. This subproject only ships the **Spot-specific modules** that get enabled by name in that generated config. So when you need to understand "what virtual host / what MUC / what ports", that lives in the base image's env-driven templates, not in this repo.

### How Spot uses it (the open-source flow)

In open-source mode the Spot-client connects straight to a configured Prosody with no proprietary backend. The client's `XMPP_CONFIG` (`spot-client/src/common/app-state/config/default-config.js`) points `hosts.muc` at `spot.<domain>` and connects over BOSH (`/http-bind`) or WebSocket. A TV and its Remotes join a **random** MUC room name on that `spot.` component; commands and status flow as MUC messages (with an optional P2P side-channel for latency). In this flow the auth/token modules below are effectively bypassed (anonymous / `allow_empty_token`); they exist for backend deployments.

### The custom Lua modules (`config/prosody-plugins-custom/`)

These implement Spot's JWT-based auth and backend integration, adapted from the jitsi-meet modules of the same names. None are wired together here — each is a Prosody module loaded by listing it under the relevant host/component in the base image's config.

- `token_auth.lib.lua` — shared library (`module:require "token_auth"`), not a standalone module. `Util.new(module)` reads `app_id` / `app_secret` (HS256) or `asap_key_server` (RS256, fetches public keys by `kid` over HTTP with caching). `Util:process_and_verify_token(session)` verifies the JWT and binds claims onto the session: `spot_room` (from `spotRoomId`), `spot_device` (from `spotDeviceId`), and any `context.user/group/features/room`. `asap_require_room_claim` defaults true.
- `mod_auth_spot_token.lua` — an `auth` provider for a VirtualHost. Pulls `?token=` off the BOSH/WebSocket URL on session creation, then verifies it via the SASL `ANONYMOUS` mechanism (no password auth). Honors `pre/post-jitsi-authentication` events. Set as the host's `authentication`.
- `mod_spot_muc_token.lua` — MUC-component module. On `muc-room-pre-create` / `muc-occupant-pre-join` it calls `verify_room`, comparing the MUC room name against `session.spot_room` from the token (admins and `allow_empty_token` are exempt; `*` means any room). Rejects mismatches with a `not-allowed` error.
- `mod_spot_muc_events.lua` — MUC-component module that reports occupancy to a backend. Hooks `muc-occupant-joined` / `-left` and POSTs `ParticipantJoined` / `ParticipantLeft` events to `spot_muc_events_url`, signing requests with a self-minted RS256 ASAP `Bearer` JWT (key at `asap_key_path`, default `/config/certs/asap.key`). Maintains a per-room occupant cache and periodically POSTs a `Snapshot` (every `spot_muc_snapshot_timer_interval`, default 3600s).
- `mod_muc_notifications.lua` — adds an HTTP endpoint at `/notifications`. An authenticated (`Bearer` JWT) `POST` with `?spot-room-muc-url=<jid>&type=<type>` looks up the live room and `broadcast_message`s a `<type xmlns="jitsi.org/spot">` stanza to its occupants. `notification_accepted_types` must be configured or the module no-ops. `GET` returns a health-check page.
- `mod_pinger.lua` — connection hygiene, unrelated to Spot logic. Watchdog per c2s session: after `c2s_idle_timeout` (default 300s) of silence it sends an XMPP ping, then closes the connection if no reply within `c2s_ping_timeout` (default 30s). Skips BOSH and smacks sessions.

## Conventions

- **Lua, Prosody module style.** Modules use `module:get_option_string/number/boolean/array` to read config, `module:hook(...)` for events, `module:provides("auth"|"http", ...)` to register providers, and `module:require "<lib>"` for shared libs in the same plugin dir. Follow that pattern; don't introduce a `prosody.cfg.lua` here — config is env-driven in the base image.
- **Adapted from jitsi-meet.** `token_auth.lib.lua`, `mod_auth_spot_token.lua`, and `mod_spot_muc_token.lua` are forks of jitsi-meet's token modules; the Spot-specific differences are the `spotRoomId` / `spotDeviceId` claims and the `spot_room` session binding. Keep parity in mind when touching them.
- **Pin the base image.** The `FROM` tag is pinned (`stable-8138`); bump it deliberately, since the base image owns the rest of the Prosody config the plugins rely on.
