import XmppConnection from './xmpp-connection';

describe('XmppConnection', () => {
    describe('convertXMLPresenceToObject', () => {
        it('transforms an IQ into a js object', () => {
            const presenceString = `
                <presence
                    from = "localPart2@domainPart2/resource2"
                    to = "localPart1@domainPart1/resource1"
                    type = "unavailable">
                    <videoMuted>true</videoMuted>
                    <isSpot>true</isSpot>
                </presence>
            `;
            const presenceIq = new DOMParser()
                .parseFromString(presenceString, 'text/xml')
                .documentElement;

            expect(XmppConnection.convertXMLPresenceToObject(presenceIq))
                .toEqual({
                    from: 'localPart2@domainPart2/resource2',
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
                    from = "localPart2@domainPart2/resource2"
                    id = "message-id"
                    to = "localPart1@domainPart1/resource1"
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
                    from: 'localPart2@domainPart2/resource2',
                    messageType: 'update-message-from-remote-control'
                });
        });
    });
});
