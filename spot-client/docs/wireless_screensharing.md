# Implementation overview of Wireless Screensharing

Last updated: September 2026

Spot supports a Spot-Remote sharing a desktop stream into a Jitsi-Meet meeting
without being physically connected to the Spot-TV; this feature is known as
wireless screensharing. The Spot-Remote captures its own screen (and, when the
browser offers it, the accompanying system audio) and streams it directly into
the meeting over a plain `RTCPeerConnection`. The Spot-TV never carries the
media — it only relays signaling between the Spot-Remote and the Jitsi-Meet
iframe.

This uses Jitsi-Meet's external share (direct-cast) API, which replaced the
Chromium-only `ProxyConnectionService`:

- Signals are pushed **into** the meeting with `api.sendExternalShareSignal(signal)`.
- Signals come **out** of the meeting via the `api.on('externalShareSignal', …)` event.
- A signal is `{ kind: 'offer' | 'answer' | 'candidate' | 'stop', sdp?, candidate? }`.
- The Spot-Remote is the **offerer**; the Jitsi-Meet meeting is the **answerer**.

## Phase 0: The setup

1. Spot-TV and Spot-Remote each have their own `RemoteControlService` and
   `XmppConnection`.
1. `XmppConnection` is the communication bus between Spot-TV and Spot-Remote. Both
   join the same MUC, so they can exchange directed messages.
1. `BaseRemoteControlService` is the facade the app uses to talk to
   `XmppConnection`. `remoteControlClient` (Spot-Remote) and
   `remoteControlServer` (Spot-TV) are its two subclasses.

## Phase 1: Spot-Remote starts screensharing

1. On the Spot-Remote, `remoteControlClient` creates a `ScreenshareConnection`
   (`screenshare-connection.ts`).
1. `ScreenshareConnection` captures the desktop with
   `navigator.mediaDevices.getDisplayMedia({ audio: true, video: … })`. The
   `audio: true` requests system audio; if the browser/user does not provide it,
   the share is video-only.
1. It creates an `RTCPeerConnection` (using the same TURN/ICE servers as the P2P
   signaling channel), adds the captured video and audio tracks, creates an
   offer, and sends `{ kind: 'offer', sdp }` to the Spot-TV as a
   `REMOTE_CONTROL_UPDATE` message. ICE candidates are trickled the same way as
   `{ kind: 'candidate', candidate }`.

## Phase 2: Spot-TV relays signals in

1. Spot-TV's `remoteControlServer` receives the `REMOTE_CONTROL_UPDATE` message
   and re-emits it internally as a `CLIENT_PROXY_MESSAGE`, tagged with the
   sender's jid.
1. `JitsiMeetingFrame` remembers that jid (as the active wireless sharer) and
   calls `api.sendExternalShareSignal(signal)` to feed the signal into the
   Jitsi-Meet meeting.

## Phase 3: Jitsi-Meet answers

1. The Jitsi-Meet meeting sets the remote offer, answers, and wraps the received
   tracks (video plus any system audio) into the conference as the local
   screenshare.
1. The meeting emits its answer and ICE candidates out through the
   `externalShareSignal` event.
1. `JitsiMeetingFrame` relays each outgoing signal to the remembered sharer jid
   via `remoteControlServer.sendMessageToRemoteControl`, which sends a
   `JITSI_MEET_UPDATE` message.

## Phase 4: Connection established

1. The Spot-Remote's `remoteControlClient` receives each `JITSI_MEET_UPDATE`
   message and hands the signal to its `ScreenshareConnection`, which applies the
   answer and the ICE candidates.
1. Once the `RTCPeerConnection` connects, the desktop video and system audio flow
   directly from the Spot-Remote into the meeting.

## Stopping

- When the Spot-Remote stops sharing (or the browser's own "Stop sharing" UI is
  used), `ScreenshareConnection` sends `{ kind: 'stop' }` and closes the peer
  connection. The Spot-Remote also sends `SET_SCREENSHARING { on: false }`, which
  turns the screenshare off inside the meeting.
- If the Spot-Remote leaves the MUC while sharing, the Spot-TV synthesizes a
  `{ kind: 'stop' }` for the meeting so the share is cleaned up.
