# Implementation overview of Wireless Screensharing

Last updated: January 2019

Spot supports a remote control being able to share a desktop stream into a Jitsi-Meet meeting without being physically connected to the Spot machine; this feature is known as wireless screensharing. The technical implementation for wireless screensharing requires several handoff stages. This document exists to provide an overview of those handoffs.

## Phase 0: The setup
1. Spot and the remote control have their own instances of XmppConnection, RemoteContorlService, and the deglate.
1. XmppConnection serves as the communication bus between a remote control and Spot to send messages.
1. RemoteControlService serves as the facade for the app to interact with XmppConnection, and XmppConnection is instantiated by RemoteControlService. During instantiation callbacks are passed into XmppConnection that allow XmppConnection to defer parsing of incoming messages to a delegate.
1. On app bootstrapping, RemoteControlService is passed in a delegate, which knows how to process incoming messages, create replies (acks), and modify app state. XmppConnection when receiving messages will call its callbacks, which call into RemoteControlService, which call into the delegate.

## Phase 1: Remote control starts screensharing
1. On the remote control, RemoteControlMenu kicks off the wirelesss screensharing flow by calling RemoteControlService.
1. RemoteControlService creates an instance of ProxyConnectionService. ProxyConnectionService is used to establish a direct connection between the remote control and the Jitsi-Meet meeting participant. At this point callbacks are passed into ProxyConnectionService that give it indirect access to XmppConnection so it can send updates as it needs to Spot, which then will send updates to Jitsi-Meet. The remote control's jid is also passed in so that all outgoing messages can be replied and routed to the initiating remote control.
1. RemoteControlService passes the ProxyConnectionService to the delegate, as the delegate knows how to handle ProxyConnectionService related updates.
1. The delegate starts the ProxyConnectionService connection.
1. ProxyConnectionService starts sending connection related messages using callbacks provided during instantiation that call into RemoteControlService which then call into XmppConnection.

## Phase 2: Spot passes messages on
1. Spot's XmppConnection instance receives message from the remote control about the desired proxy connection.
1. Spot's XmppConnection uses its callbacks, which call into RemoteContorlService and then the delegate.
1. Spot's delegate reads app state to get access to the JitsiMeetExternalApi (iframe api) instance in order to pass the messages into Jitsi-Meet.

## Phase 3: Jitsi-meet responds
1. Jitsi-Meet processes the messages from the remote control, kicking off its own screensharing flow. It likely creates its own ProxyConnectionService.
1. Jitsi-Meet sends messages back through the JitsiMeetExternalApi. The messages include the remote control jid to pass the message to.
1. A listener in the MeetingFrame view is invoked and calls into RemoteControlService to pass along messages to the appropriate remote control jid.
1. RemoteControlService calls into XmppConnection to pass the messages.

## Phase 4: Proxy connection established
1. The remote control's XmppConnection receives the the messages.
1. XmppConnection invokes callbacks, set by the RemoteControlService, which route the messages into the delegate.
1. The delegate parses the messages and passes them into remote control instance of ProxyConnectionService.
1. As messages are passed back and forth, eventually a direct connection between the remote control and the Jitsi-Meet meeting participant is established. Through this connection the remote control is able to send a desktop stream.
