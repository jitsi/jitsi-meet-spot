import XmppConnection from './xmpp-connection';
import { tickProcess } from 'common/test-utils';

jest.mock('common/vendor', () => {
    const { mockJitsiMeetJSProvider } = require('../test-mocks');

    return {
        JitsiMeetJSProvider: mockJitsiMeetJSProvider
    };
});

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

    describe('silent reconnect', () => {
        let xmppConnection;

        /**
         * Helper for mocking out XMPPConnection calls so the connection is
         * simulated as being made.
         *
         * @param {XMPPConection} connection - The instance of XMPPConnection
         * to simulate becoming connected to an xmpp server.
         * @returns {void}
         */
        function joinMuc(connection) {
            const joinPromise = connection.joinMuc({
                shouldAttemptReconnect: () => true
            });

            connection.xmppConnection._simulateConnectionEstablished();
            connection.xmppConnection._simulatePresenceUpdate();

            return tickProcess(1)
                .then(() => connection.room._simulateJoinEvent())
                .then(() => joinPromise);
        }

        beforeEach(() => {
            jest.useFakeTimers();

            xmppConnection = new XmppConnection({
                configuration: {},
                onPresenceReceived: jest.fn()
            });

            return joinMuc(xmppConnection);
        });

        it('silently tries to re-establish connection with a back-off', () => {
            const error = 'connection.droppedError';
            const joinMucSpy = jest.spyOn(xmppConnection, 'joinMuc')
                .mockReturnValue(Promise.reject(error));

            xmppConnection.xmppConnection._simulateConnectionFailed(error);

            return tickProcess(1)
                .then(() => {
                    // wait at least one second for the first attempt
                    jest.advanceTimersByTime(999);

                    expect(joinMucSpy.mock.calls.length).toEqual(0);

                    jest.runAllTimers();

                    return tickProcess(1);
                })
                .then(() => {
                    expect(joinMucSpy.mock.calls.length).toEqual(1);

                    // wait at least four seconds for the second attempt
                    jest.advanceTimersByTime(3999);

                    expect(joinMucSpy.mock.calls.length).toEqual(1);

                    jest.runAllTimers();

                    return tickProcess(1);
                })
                .then(() => {
                    expect(joinMucSpy.mock.calls.length).toEqual(2);

                    // wait at least six seconds for the third attempt
                    jest.advanceTimersByTime(15999);

                    expect(joinMucSpy.mock.calls.length).toEqual(2);

                    jest.runAllTimers();

                    return tickProcess(1);
                })
                .then(() => {
                    expect(joinMucSpy.mock.calls.length).toEqual(3);
                });
        });
    });
});
