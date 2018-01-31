/* eslint-disable max-len */
const config = {
    googleApiClientId:
        '173322678330-q22133vibsb22jgfep7tj78ff1d0aqce.apps.googleusercontent.com',
    meetingDomain: 'lenny.jitsi.net',
    ultrasoundFilesDirectory:
        '/',
    xmppConfig: {
        bosh: 'https://lenny.jitsi.net/http-bind',
        hosts: {
            domain: 'lenny.jitsi.net',
            muc: 'conference.lenny.jitsi.net',
            focus: 'focus.lenny.jitsi.net'
        }
    }
};

const configInterface = {
    get(name) {
        return config[name];
    }
};

export default configInterface;
