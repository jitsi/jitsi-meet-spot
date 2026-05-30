import { findWhitelistedMeetingUrl, isValidMeetingUrl } from './meeting';

describe('meeting utils', () => {
    describe('findWhitelistedMeetingUrl', () => {
        it('returns the first url that matching the known domains', () => {
            const meetingUrl = 'https://beta.meet.jit.si/anymeetingname';
            const fields = [
                'location is in the office',
                `testing meeting url at ${meetingUrl}`,
                'agenda is to talk about work'
            ];
            const knownDomains = [ 'beta.meet.jit.si', 'meet.jit.si', 'any.jitsi.net' ];

            expect(findWhitelistedMeetingUrl(fields, knownDomains)).toEqual(meetingUrl);
        });

        it('handles parent domain corner cases', () => {
            expect(findWhitelistedMeetingUrl(
                [ 'https://alpha.beta.meet.jit.si/m' ],
                [ 'meet.jit.si' ]))
                .toEqual('https://alpha.beta.meet.jit.si/m');

            expect(findWhitelistedMeetingUrl(
                [ 'https://beta.meet.jit.si/m' ],
                [ 'meet.jit.si' ]))
                .toEqual('https://beta.meet.jit.si/m');

            expect(findWhitelistedMeetingUrl(
                [ 'https://meet.jit.si/m' ],
                [ 'meet.jit.si' ]))
                .toEqual('https://meet.jit.si/m');
            expect(findWhitelistedMeetingUrl(
                [ 'https://meet.jit.si/m' ],
                [ 'si' ]))
                .toEqual('https://meet.jit.si/m');

            expect(findWhitelistedMeetingUrl(
                [ 'https://1meet.jit.si/m' ],
                [ 'meet.jit.si' ]))
                .toEqual(undefined);

            expect(findWhitelistedMeetingUrl(
                [ 'https://meet.jit1.si/m' ],
                [ 'meet.jit.si' ]))
                .toEqual(undefined);

            expect(findWhitelistedMeetingUrl(
                [ 'https://meet.jit.si1/m' ],
                [ 'meet.jit.si' ]))
                .toEqual(undefined);
        });

        it('can match vanity urls', () => {
            const meetingUrl = 'https://lenny.jitsi.net/testmeeting';
            const fields = [
                'location is in this url https://meet.jit.si/testing',
                `alternative testing meeting url at ${meetingUrl}`,
                'agenda is to talk about work'
            ];
            const knownDomains = [ 'jitsi.net' ];

            expect(findWhitelistedMeetingUrl(fields, knownDomains)).toEqual(meetingUrl);
        });

        it('excludes any urls with static in the path due to the jitsi dial in info page', () => {
            const meetingUrl = 'https://lenny.jitsi.net/testmeeting';
            const fields = [
                'get dial in numbers here https://lenny.jitsi.net/static/dialin',
                `alternative testing meeting url at ${meetingUrl}`,
                'agenda is to talk about work'
            ];
            const knownDomains = [ '.*jitsi.net' ];

            expect(findWhitelistedMeetingUrl(fields, knownDomains)).toEqual(meetingUrl);
        });
    });

    describe('isValidMeetingUrl', () => {
        it('for non-urls returns false', () => {
            expect(isValidMeetingUrl('a meeting name')).toBe(false);
        });

        it('for urls without a meeting name returns false', () => {
            expect(isValidMeetingUrl('https://meet.jit.si')).toBe(false);
        });

        it('for urls without whitelist returns true', () => {
            expect(isValidMeetingUrl('https://meet.jit.si/testname1234')).toBe(true);

        });

        it('for urls matching the whitelist returns true', () => {
            expect(isValidMeetingUrl('https://meet.jit.si/testname1234', [ 'meet.jit.si' ])).toBe(true);
        });

        it('for urls not matching the whitelist returns false', () => {
            expect(isValidMeetingUrl('https://any.jitsi.net/testname1234', [ 'meet.jit.si' ])).toBe(false);
        });
    });
});
