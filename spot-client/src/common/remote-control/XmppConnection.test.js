import XmppConnection from './xmpp-connection';

describe('XmppConnection', () => {
    const IQ_FROM = 'localPart2@domainPart2/resource2';
    const IQ_TO = 'localPart1@domainPart1/resource1';

    describe('convertXMLCommandToObject', () => {
        it('transforms an IQ into a js object', () => {
            const commandString = `
                <iq
                    from = "${IQ_FROM}"
                    id = "message-id"
                    to = "${IQ_TO}">
                    <command type = "setAudioMute">
                        {"mute":true}
                    </command>
                </iq>
            `;
            const commandIq = new DOMParser()
                .parseFromString(commandString, 'text/xml')
                .documentElement;

            expect(XmppConnection.convertXMLCommandToObject(commandIq))
                .toEqual({
                    commandType: 'setAudioMute',
                    data: {
                        mute: true
                    },
                    from: IQ_FROM,
                    id: 'message-id'
                });
        });
    });

    describe('convertXMLPresenceToObject', () => {
        it('transforms an IQ into a js object', () => {
            const presenceString = `
                <presence
                    from = "${IQ_FROM}"
                    to = "${IQ_TO}"
                    type = "unavailable">
                    <videoMuted>true</videoMuted>
                    <isSpot>true</isSpot>
                </presence>
            `;
            const presenceIq = new DOMParser()
                .parseFromString(presenceString, 'text/xml')
                .documentElement;

            const xmppConnection = new XmppConnection();

            expect(xmppConnection.convertXMLPresenceToObject(presenceIq))
                .toEqual({
                    from: IQ_FROM,
                    localUpdate: false,
                    state: {
                        isSpot: true,
                        videoMuted: true
                    },
                    type: 'unavailable'
                });
        });
    });
    describe('convertXMLMessageToObject', () => {
        it('transforms an IQ into a js object', () => {
            const messageString = `
                <iq
                    from = "${IQ_FROM}"
                    id = "message-id"
                    to = "${IQ_TO}"
                    type = "set">
                    <message type = "update-message-from-remote-control">
                        {"key":"value"}
                    </message>
                </iq>
            `;
            const messageIq = new DOMParser()
                .parseFromString(messageString, 'text/xml')
                .documentElement;

            expect(XmppConnection.convertXMLMessageToObject(messageIq))
                .toEqual({
                    data: {
                        key: 'value'
                    },
                    id: 'message-id',
                    from: IQ_FROM,
                    messageType: 'update-message-from-remote-control'
                });
        });
    });
});
