import {
    addNotification,
    getDesktopSharingFramerate,
    getDisplayName,
    getDtmfThrottleRate,
    getInMeetingStatus,
    getJitsiAppName,
    getJwt,
    getJwtDomains,
    getKickTemporaryRemotesOnMeetingEnd,
    getMeetingJoinTimeout,
    getPreferredCamera,
    getPreferredMic,
    getPreferredResolution,
    getPreferredSpeaker,
    getWiredScreenshareInputLabel,
    leaveMeetingWithError,
    storePhoneNumberFromInvites
} from 'common/app-state';
import { logger } from 'common/logger';
import { ROUTES } from 'common/routing';
import { Loading } from 'common/ui';
import { findWhitelistedMeetingUrl } from 'common/utils';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { disconnectAllTemporaryRemotes, setMeetingSummary } from './../../app-state';
import {
    KickedOverlay,
    MeetingFrame,
    MeetingStatus,
    PasswordRequiredOverlay,
    WaitingForMeetingStartOverlay
} from './../components';

/**
 * The query params parsed from the current window location.
 */
interface IQueryParams {
    invites?: any;
    location: string | null;
    meetingDisplayName: string | null;
    screenshare: boolean;
    startWithVideoMuted: boolean;
}

/**
 * Details about why the current view is being exited.
 */
interface ILeaveEvent {
    error?: string;
    errorCode?: string;
    meetingSummary?: any;
}

interface IProps {
    disconnectAllTemporaryRemotes: () => void;
    displayName?: string;
    dtmfThrottleRate?: number;
    history: any;
    jitsiAppName?: string;
    jwt?: string;
    jwtDomains?: any[];
    kickTemporaryRemotesOnMeetingEnd?: boolean;
    location: any;
    match?: any;
    maxDesktopSharingFramerate?: number;
    meetingJoinTimeout?: number;
    minDesktopSharingFramerate?: number;
    onError: (errorCode?: string, error?: string) => void;
    preferredCamera?: string;
    preferredMic?: string;
    preferredResolution?: string;
    preferredSpeaker?: string;
    processMeetingSummary: (meetingSummary: any) => void;
    remoteControlServer?: any;
    screenshareDevice?: string;
    showKickedOverlay?: boolean;
    showPasswordPrompt?: boolean;
    storePhoneNumberFromInvites: (invites?: any) => void;
    waitingForMeetingStart?: boolean;
}

interface IState {
    meetingLoaded: boolean;
}

/**
 * Displays a Jitsi-Meet meeting.
 */
export class Meeting extends React.Component<IProps, IState> {
    _queryParams: IQueryParams;
    _useJwt: boolean;

    /**
     * Initializes a new {@code Meeting} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this._queryParams = this._getQueryParams();

        this._useJwt = false;

        if (this._queryParams.location && props.jwt) {
            this._useJwt = Boolean(findWhitelistedMeetingUrl(
                [ this._queryParams.location ], props.jwtDomains ?? []
            ));
        }

        this.state = {
            meetingLoaded: false
        };

        this._onMeetingLeave = this._onMeetingLeave.bind(this);
        this._onMeetingStart = this._onMeetingStart.bind(this);
        this._onRedirectToHome = this._onRedirectToHome.bind(this);
    }

    /**
     * Redirects back the home view if no valid meeting url has been detected.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (!this._queryParams.location) {
            logger.error(
                'No valid meeting url detected.',
                { params: this.props.location.search }
            );
            this._onMeetingLeave();
        }

        this.props.storePhoneNumberFromInvites(this._queryParams.invites);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const {
            invites,
            location,
            meetingDisplayName,
            screenshare,
            startWithVideoMuted
        } = this._queryParams;

        if (!location) {
            return null;
        }

        const {
            displayName,
            dtmfThrottleRate,
            jitsiAppName,
            jwt,
            maxDesktopSharingFramerate,
            meetingJoinTimeout,
            minDesktopSharingFramerate,
            preferredCamera,
            preferredMic,
            preferredResolution,
            preferredSpeaker,
            remoteControlServer,
            screenshareDevice,
            showKickedOverlay,
            showPasswordPrompt,
            waitingForMeetingStart
        } = this.props;
        const {
            meetingLoaded
        } = this.state;

        return (
            <div className = { `meeting-view ${meetingLoaded ? '' : 'loading'}` }>
                <MeetingFrame
                    displayName = { displayName }
                    dtmfThrottleRate = { dtmfThrottleRate }
                    invites = { invites }
                    jitsiAppName = { jitsiAppName }
                    jwt = { this._useJwt ? jwt : undefined }
                    maxDesktopSharingFramerate = { maxDesktopSharingFramerate }
                    meetingDisplayName = { meetingDisplayName ?? undefined }
                    meetingJoinTimeout = { meetingJoinTimeout }
                    meetingUrl = { location }
                    minDesktopSharingFramerate = { minDesktopSharingFramerate }
                    onMeetingLeave = { this._onMeetingLeave }
                    onMeetingStart = { this._onMeetingStart }
                    preferredCamera = { preferredCamera }
                    preferredMic = { preferredMic }
                    preferredResolution = { preferredResolution }
                    preferredSpeaker = { preferredSpeaker }
                    remoteControlServer = { remoteControlServer }
                    screenshareDevice = { screenshareDevice }
                    startWithScreenshare = { screenshare }
                    startWithVideoMuted = { startWithVideoMuted } />
                {
                    !meetingLoaded
                        && <div className = 'loading-curtain'>
                            <Loading />
                        </div>
                }
                { waitingForMeetingStart && <WaitingForMeetingStartOverlay /> }
                { showPasswordPrompt && this._renderPasswordPrompt() }
                {
                    showKickedOverlay
                        && <KickedOverlay onRedirect = { this._onRedirectToHome } />
                }
                <MeetingStatus />
                {

                    /**
                     * The browser gives mouse cursor styling priority to the
                     * MeetingFrame (iframe) contents. To hide the cursor,
                     * blanket the MeetingFrame with a div controlled by Spot to
                     * prevent the browser from detecting the mouse cursor being
                     * over an iframe.
                     */
                }
                <div className = 'meetingMouseHider' />
            </div>
        );
    }

    /**
     * Parses the current window location for any relevant query params.
     *
     * @private
     * @returns
     */
    _getQueryParams(): IQueryParams {
        const queryParams = new URLSearchParams(this.props.location.search);
        const invitesParam = queryParams.get('invites');
        const location = queryParams.get('location');
        const meetingDisplayNameParam = queryParams.get('meetingDisplayName');
        const screenshareParam = queryParams.get('screenshare');
        const startWithVideoMutedParam = queryParams.get('startWithVideoMuted');

        let invites;

        try {
            invites = JSON.parse(decodeURIComponent(invitesParam ?? ''));
        } catch (error) {
            logger.error('Could not parse invites param', { error });
        }

        let meetingDisplayName: string | null = null;

        try {
            meetingDisplayName = meetingDisplayNameParam;
        } catch (error) {
            logger.error('Could not parse meeting display name param', { error });
        }

        return {
            invites,
            location,
            meetingDisplayName,
            screenshare: screenshareParam === 'true',
            startWithVideoMuted: startWithVideoMutedParam === 'true'
        };
    }

    /**
     * Callback invoked when the meeting ends. Attempts to redirect to the
     * home view.
     *
     * @param leaveEvent - Details about why the current view is being
     * exited.
     * @param leaveEvent.error - An error, if any, which caused the
     * current view to be exited.
     * @param leaveEvent.errorCode - The string representing the cause
     * of the error.
     * @param leaveEvent.meetingSummary - A summary for the meeting.
     * @returns
     */
    _onMeetingLeave(leaveEvent: ILeaveEvent = {}) {
        const {
            error,
            errorCode,
            meetingSummary
        } = leaveEvent;

        if (meetingSummary) {
            this.props.processMeetingSummary(meetingSummary);
        }

        if (error) {
            logger.log('Leaving meeting due to error', {
                error,
                errorCode
            });
            this.props.onError(errorCode, error);
        } else if (this.props.kickTemporaryRemotesOnMeetingEnd) {
            logger.log('Kicking temporary remotes');
            this.props.disconnectAllTemporaryRemotes();
        }

        this._onRedirectToHome();
    }

    /**
     * Callback invoked when the process of joining the meeting has started.
     *
     * @private
     * @returns
     */
    _onMeetingStart() {
        this.setState({
            meetingLoaded: true
        });
    }

    /**
     * Changes the location to go back to the Spot-TV Home.
     *
     * @private
     * @returns
     */
    _onRedirectToHome() {
        this.props.history.push(ROUTES.HOME);
    }

    /**
     * Renders a text overlay which hides Jitsi-Meet iFrame when it's asking for
     * a password.
     *
     * @returns
     * @private
     */
    _renderPasswordPrompt() {
        return <PasswordRequiredOverlay />;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Meeting}.
 *
 * @param state - The Redux state.
 * @private
 * @returns
 */
function mapStateToProps(state: any) {
    // Intentionally pass the config object separately to avoid a new object
    // from the selector triggering a re-render.
    const {
        max: maxDesktopSharingFramerate,
        min: minDesktopSharingFramerate
    } = getDesktopSharingFramerate(state);
    const {
        kicked,
        needPassword,
        waitingForMeetingStart
    } = getInMeetingStatus(state);

    return {
        displayName: getDisplayName(state),
        dtmfThrottleRate: getDtmfThrottleRate(state),
        jitsiAppName: getJitsiAppName(state),
        jwt: getJwt(state),
        jwtDomains: getJwtDomains(state),
        maxDesktopSharingFramerate,
        meetingJoinTimeout: getMeetingJoinTimeout(state),
        minDesktopSharingFramerate,
        kickTemporaryRemotesOnMeetingEnd: getKickTemporaryRemotesOnMeetingEnd(state),
        showKickedOverlay: kicked,
        showPasswordPrompt: needPassword,
        preferredCamera: getPreferredCamera(state),
        preferredMic: getPreferredMic(state),
        preferredResolution: getPreferredResolution(state),
        preferredSpeaker: getPreferredSpeaker(state),
        screenshareDevice: getWiredScreenshareInputLabel(state),
        waitingForMeetingStart
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns
 */
function mapDispatchToProps(dispatch: any) {
    return {
        /**
         * Callback to invoke to cause all temporary Spot-Remotes to disconnect.
         *
         * @returns
         */
        disconnectAllTemporaryRemotes() {
            dispatch(disconnectAllTemporaryRemotes());
        },

        /**
         * Callback invoked when an error occurs while joining a meeting.
         *
         * @param errorCode - The abstract representation of the error.
         * @param error - An error message to display in an error
         * notification.
         * @returns
         */
        onError(errorCode?: string, error?: string) {
            dispatch(leaveMeetingWithError(errorCode ?? ''));
            dispatch(addNotification('error', error ?? ''));
        },

        /**
         * Does something with the meeting summary. Currently emits an event.
         *
         * @param meetingSummary - Summary for meeting that just ended.
         * @returns
         */
        processMeetingSummary(meetingSummary: any) {
            dispatch(setMeetingSummary(meetingSummary));
        },

        /**
         * Dispatches an action which is supposed to store or clear a phone number that's being dialed using the iframe
         * api.
         *
         * @param [invites] - An array of invites parsed from the URL query.
         * @returns
         */
        storePhoneNumberFromInvites(invites?: any) {
            dispatch(storePhoneNumberFromInvites(invites));
        }
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Meeting));
