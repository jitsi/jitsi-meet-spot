import { findWhitelistedMeetingUrl } from './meeting';
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

        it('can match vanity urls', () => {
            const meetingUrl = 'https://lenny.jitsi.net/testmeeting';
            const fields = [
                'location is in this url https://meet.jit.si./testing',
                `alternative testing meeting url at ${meetingUrl}`,
                'agenda is to talk about work'
            ];
            const knownDomains = [ '.*jitsi.net' ];

            expect(findWhitelistedMeetingUrl(fields, knownDomains)).toEqual(meetingUrl);
        });
    });
});
