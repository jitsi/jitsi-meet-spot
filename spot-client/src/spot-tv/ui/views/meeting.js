import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
    addNotification,
    getAvatarUrl,
    getDesktopSharingFramerate,
    getDisplayName,
    getInMeetingStatus,
    getJitsiAppName,
    getJwt,
    getJwtDomains,
    getPreferredCamera,
    getPreferredMic,
    getPreferredSpeaker,
    getTenant,
    getWiredScreenshareInputLabel,
    shouldKickTemporaryRemotes
} from 'common/app-state';
import { isBackendEnabled } from 'common/backend';
import { logger } from 'common/logger';
import { isValidMeetingName, isValidMeetingUrl } from 'common/utils';
import { ROUTES } from 'common/routing';
import { Loading } from 'common/ui';

import {
    disconnectAllTemporaryRemotes,
    getDefaultMeetingDomain
} from './../../app-state';
import { KickedOverlay, MeetingFrame, MeetingStatus } from './../components';

/**
 * Displays a Jitsi-Meet meeting.
 *
 * @extends React.Component
 */
export class Meeting extends React.Component {
    static propTypes = {
        avatarUrl: PropTypes.string,
        defaultMeetingDomain: PropTypes.string,
        disconnectAllTemporaryRemotes: PropTypes.func,
        displayName: PropTypes.string,
        history: PropTypes.object,
        jitsiAppName: PropTypes.string,
        jwt: PropTypes.string,
        jwtDomains: PropTypes.array,
        kickTemporaryRemotesOnMeetingEnd: PropTypes.bool,
        location: PropTypes.object,
        match: PropTypes.object,
        maxDesktopSharingFramerate: PropTypes.number,
        minDesktopSharingFramerate: PropTypes.number,
        onError: PropTypes.func,
        preferredCamera: PropTypes.string,
        preferredMic: PropTypes.string,
        preferredSpeaker: PropTypes.string,
        remoteControlServer: PropTypes.object,
        screenshareDevice: PropTypes.string,
        showKickedOverlay: PropTypes.bool,
        showPasswordPrompt: PropTypes.bool,
        tenant: PropTypes.string
    };

    /**
     * Initializes a new {@code Meeting} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._queryParams = this._getQueryParams();

        this._useJwt = false;

        if (this._queryParams.location && props.jwt) {
            const { host } = new URL(this._queryParams.location);

            this._useJwt = props.jwtDomains.includes(host);
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
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { invites, location, screenshare, startWithVideoMuted } = this._queryParams;

        if (!location) {
            return null;
        }

        const {
            avatarUrl,
            displayName,
            jitsiAppName,
            jwt,
            maxDesktopSharingFramerate,
            minDesktopSharingFramerate,
            preferredCamera,
            preferredMic,
            preferredSpeaker,
            remoteControlServer,
            screenshareDevice,
            showKickedOverlay,
            showPasswordPrompt
        } = this.props;

        return (
            <div className = 'meeting-view'>
                <MeetingFrame
                    avatarUrl = { avatarUrl }
                    displayName = { displayName }
                    invites = { invites }
                    jitsiAppName = { jitsiAppName }
                    jwt = { this._useJwt ? jwt : undefined }
                    maxDesktopSharingFramerate = { maxDesktopSharingFramerate }
                    meetingUrl = { location }
                    minDesktopSharingFramerate = { minDesktopSharingFramerate }
                    onMeetingLeave = { this._onMeetingLeave }
                    onMeetingStart = { this._onMeetingStart }
                    preferredCamera = { preferredCamera }
                    preferredMic = { preferredMic }
                    preferredSpeaker = { preferredSpeaker }
                    remoteControlServer = { remoteControlServer }
                    screenshareDevice = { screenshareDevice }
                    startWithScreenshare = { screenshare }
                    startWithVideoMuted = { startWithVideoMuted } />
                {
                    !this.state.meetingLoaded
                        && <div className = 'loading-curtain'>
                            <Loading />
                        </div>
                }
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
     * @returns {Object}
     */
    _getQueryParams() {
        const queryParams = new URLSearchParams(this.props.location.search);
        const invitesParam = queryParams.get('invites');
        const locationParam = queryParams.get('location');
        const screenshareParam = queryParams.get('screenshare');
        const startWithVideoMutedParam = queryParams.get('startWithVideoMuted');

        let invites;

        try {
            invites = JSON.parse(decodeURIComponent(invitesParam));
        } catch (error) {
            /** no op */
        }

        let location;

        if (isValidMeetingUrl(locationParam)) {
            location = locationParam;
        } else if (isValidMeetingName(locationParam)) {
            location = `https://${this.props.defaultMeetingDomain}/${locationParam}`;
        }

        return {
            invites,
            location,
            screenshare: screenshareParam === 'true',
            startWithVideoMuted: startWithVideoMutedParam === 'true'
        };
    }

    /**
     * Callback invoked when the meeting ends. Attempts to redirect to the
     * home view.
     *
     * @param {Object} leaveEvent - Details about why the current view is being
     * exited.
     * @param {string} leaveEvent.error - An error, if any, which caused the
     * current view to be exited.
     * @returns {void}
     */
    _onMeetingLeave(leaveEvent = {}) {
        if (leaveEvent.error) {
            logger.log('Leaving meeting due to error', { error: leaveEvent.error });
            this.props.onError(leaveEvent.error);
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
     * @returns {void}
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
     * @returns {void}
     */
    _onRedirectToHome() {
        this.props.history.push(ROUTES.HOME);
    }

    /**
     * Renders a text overlay which hides Jitsi-Meet iFrame when it's asking for
     * a password.
     *
     * @returns {ReactNode}
     * @private
     */
    _renderPasswordPrompt() {
        return (
            <div className = 'status-overlay'>
                <div className = 'status-overlay-text-frame'>
                    <h1>Password required to join</h1>
                    <div className = 'status-overlay-text'>
                        <div>You can use the remote control device to submit a password.</div>
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Meeting}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    // Intentionally pass the config object separately to avoid a new object
    // from the selector triggering a re-render.
    const {
        max: maxDesktopSharingFramerate,
        min: minDesktopSharingFramerate
    } = getDesktopSharingFramerate(state);
    const {
        kicked,
        needPassword
    } = getInMeetingStatus(state);

    return {
        avatarUrl: getAvatarUrl(state),
        defaultMeetingDomain: getDefaultMeetingDomain(state),
        displayName: getDisplayName(state),
        jitsiAppName: getJitsiAppName(state),
        jwt: getJwt(state),
        jwtDomains: getJwtDomains(state),
        maxDesktopSharingFramerate,
        minDesktopSharingFramerate,
        kickTemporaryRemotesOnMeetingEnd: shouldKickTemporaryRemotes(state)
            && isBackendEnabled(state),
        showKickedOverlay: kicked,
        showPasswordPrompt: needPassword,
        preferredCamera: getPreferredCamera(state),
        preferredMic: getPreferredMic(state),
        preferredSpeaker: getPreferredSpeaker(state),
        screenshareDevice: getWiredScreenshareInputLabel(state),
        tenant: getTenant(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Callback to invoke to cause all temporary Spot-Remotes to disconnect.
         *
         * @returns {void}
         */
        disconnectAllTemporaryRemotes() {
            dispatch(disconnectAllTemporaryRemotes());
        },

        /**
         * Callback invoked when an error occurs while joining a meeting.
         *
         * @param {string} error - An error message to display in an error
         * notification.
         * @returns {void}
         */
        onError(error) {
            dispatch(addNotification('error', error));
        }
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Meeting));
