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
        it('transforms MUC presence into a js object', () => {
            const spotStatus = JSON.stringify({
                videoMuted: true,
                isSpot: true
            });
            const presenceString = `
                <presence
                    from = "${IQ_FROM}"
                    to = "${IQ_TO}">
                    <spot-status xmlns="https://jitsi.org/spot">
                        ${spotStatus}                    
                    </spot-status>
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
                    type: 'join',
                    unavailableReason: undefined
                });
        });

        it('transforms legacy MUC presence into a js object', () => {
            const calendarArray = [ {
                name: 'name1',
                number: 123
            }, {
                name: 'name2',
                number: 456
            } ];

            const presenceString = `
                <presence
                    from = "${IQ_FROM}"
                    to = "${IQ_TO}">
                    <videoMuted>true</videoMuted>
                    <isSpot>true</isSpot>
                    <calendar>${JSON.stringify(calendarArray)}</calendar>
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
                    type: 'join',
                    state: {
                        calendar: calendarArray,
                        isSpot: true,
                        videoMuted: true
                    },
                    unavailableReason: undefined
                });

            // Legacy handling is expected to be removed after 04/01/2020 @ 12:00am (UTC)
            expect(Date.now()).toBeLessThan(1585699200000);
        });

        it('provides a reason for being unavailable when kicked', () => {
            const presenceString = `
                <presence
                    from = "${IQ_FROM}"
                    to = "${IQ_TO}"
                    type = "unavailable">
                    <status code="307" />
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
                    type: 'unavailable',
                    state: undefined,
                    unavailableReason: 'kicked'
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
