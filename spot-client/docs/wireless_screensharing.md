# Implementation overview of Wireless Screensharing

Last updated: March 2019

Spot supports a Spot-Remote being able to share a desktop stream into a Jitsi-Meet meeting without being physically connected to the Spot-TV; this feature is known as wireless screensharing. The technical implementation for wireless screensharing requires establishing a peer connection between the Spot-Remote and the Jitsi-Meet meeting participant, and there are several handoff stages for offers, answers, and various other updates. This document exists to provide an overview of those handoffs.

Diagrams: https://sketchboard.me/VBo2MpWJlRwl#/

## Phase 0: The setup
1. Spot-TV and Spot-Remote each have their own instances of RemoteControlService and XmppConnection.
1. XmppConnection serves as the communication bus between Spot-TV and Spot-Remote to send messages. It controls the connection to the MUC, which both the Spot-Remote and Spot-TV join so they message each other.
1. RemoteControlService is the facade for the Spot app to interact with XmppConnection, and XmppConnection is instantiated by RemoteControlService. During instantiation of XmppConnection, RemoteControlService passes in callbacks to XmppConnection that allow XmppConnection to defer parsing of incoming IQs and private messages.

## Phase 1: Spot-Remote starts screensharing
1. On Spot-Remote, RemoteControlService is called to kick off the wireless screensharing flow.
1. RemoteControlService creates an instance of ProxyConnectionService. ProxyConnectionService is used to establish and maintain a direct connection between Spot-Remote and the Jitsi-Meet participant. At this point callbacks are passed into ProxyConnectionService that give it indirect access to XmppConnection so it can send updates as it needs to Spot-TV, which then will send updates to Jitsi-Meet via the JitsiMeetExternalAPI. The Spot-Remote's MUC jid are also passed in to ProxyConnection so that it can filter all messages received from the MUC and act on the screensharing related messages sent directly to the Spot-Remote.
1. RemoteControlService holds a references to the ProxyConnectionService.
1. RemoteControlService starts the ProxyConnectionService connection flow.
1. ProxyConnectionService starts sending connection related messages using callbacks provided during instantiation that call into RemoteControlService which then call into XmppConnection. XmppConnection sends those messages into the MUC to Spot-TV.

## Phase 2: Spot-TV passes messages on
1. Spot-TV's XmppConnection instance receives message from the Spot-Remote about the desired proxy connection.
1. Spot-TV's XmppConnection uses its callbacks, which call into RemoteControlService, and notify any in-app listeners which are registered for incoming messages.
1. At this point Spot-TV's MeetingFrame should have already registered listeners for messages from RemoteControlService and those callbacks should be invoked.
1. Spot-TV's MeetingFrame passes the messages into Jitsi-Meet through the JitsiMeetExternalApi.

## Phase 3: Jitsi-Meet responds
1. Jitsi-Meet processes the messages from Spot-Remote by kicking off its own screensharing flow. It likely creates its own ProxyConnectionService.
1. Jitsi-Meet sends messages back through the JitsiMeetExternalApi to Spot-TV. The messages include the Spot-Remote jid.
1. Jitsi-Meet's JitsiMeetExternalApi messages trigger a callback in Spot-TV's MeetingFrame.
1. Spot-TV's MeetingFrame calls into RemoteControlService to pass along the messages to the appropriate Spot-Remote.
1. RemoteControlService calls into XmppConnection to pass the messages to the appropriate Spot-Remote.

## Phase 4: Proxy connection established between Spot-Remote and Jitsi-Meet participant
1. Spot-Remote's XmppConnection receives the the messages from Spot-TV, which were originally sent by Jitsi-Meet.
1. Spot-Remote's XmppConnection invokes callbacks registered by the RemoteControlService.
1. Spot-Remote's RemoteControlService passes the messages to its instance of ProxyConnectionService.
1. As messages are passed back and forth, between Spot-Remote and Jitsi-Meet participant, eventually a direct connection between the Spot-Remote and the Jitsi-Meet participant is established.
1. Through the established connection Spot-Remote sends its desktop stream to the Jitsi-Meet participant to use as a screensharing source.
