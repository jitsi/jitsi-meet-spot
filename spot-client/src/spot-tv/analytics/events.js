/**
 * Events used when spot is connecting to the backend using a pairing code.
 */
export const backendPairingEvents = {
    SUBMIT: 'backend-pairing-code-submit',
    VALIDATE_FAIL: 'backend-pairing-code-validation-fail',
    VALIDATE_SUCCESS: 'backend-pairing-code-validation-success'
};

export const calendarEvents = {
    CALENDAR_ERROR: 'calendar-error'
};

export const connectionEvents = {
    CONNECTION_FAILED: 'connection-failed'
};

export const meetingEvents = {
    SUMMARY: 'meeting-summary'
};

export const meetingLeaveEvents = {
    UNEXPECTED: 'unexpected-meeting-end'
};
