import XmppConnection from './xmpp-connection';

describe('XmppConnection', () => {
    describe('convertXMLPresenceToObject', () => {
        it('transforms an IQ into a js object', () => {
            const presenceString = `
                <presence
                    from = "localPart2@domainPart2/resource2"
                    to = "localPart1@domainPart1/resource1" from = "localPart2@domainPart2/resource2"
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
});
