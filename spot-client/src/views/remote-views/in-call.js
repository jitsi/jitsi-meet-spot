import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { LoadingIcon } from 'features/loading-icon';
import { getInMeetingStatus } from 'reducers';
import { parseMeetingUrl } from 'utils';

import { RemoteControlMenu } from 'features/remote-control-menu';

/**
 * A view for displaying ways to interact with the Spot while Spot is in a
 * meeting.
 *
 * @extends React.Component
 */
export class InCall extends React.Component {
    static propTypes = {
        audioMuted: PropTypes.bool,
        dispatch: PropTypes.func,
        inMeeting: PropTypes.string,
        isWirelessScreenshareConnectionActive: PropTypes.bool,
        remoteControlService: PropTypes.object,
        screensharing: PropTypes.bool,
        videoMuted: PropTypes.bool,
        wiredScreensharingEnabled: PropTypes.bool
    };

    /**
     * Implements React's {@link SettingsMenu#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            audioMuted,
            inMeeting,
            isWirelessScreenshareConnectionActive,
            remoteControlService,
            screensharing,
            videoMuted,
            wiredScreensharingEnabled
        } = this.props;

        if (!inMeeting) {
            return <LoadingIcon color = 'white' />;
        }

        const { meetingName } = parseMeetingUrl(inMeeting);

        return (
            <div className = 'in-call'>
                <div className = 'in-call-name'>{ meetingName }</div>
                <RemoteControlMenu
                    audioMuted = { audioMuted }
                    isWirelessScreenshareConnectionActive
                        = { isWirelessScreenshareConnectionActive }
                    remoteControlService = { remoteControlService }
                    screensharing = { screensharing }
                    screensharingEnabled = { wiredScreensharingEnabled }
                    videoMuted = { videoMuted } />
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code InCall}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        ...getInMeetingStatus(state)
    };
}

export default connect(mapStateToProps)(InCall);
