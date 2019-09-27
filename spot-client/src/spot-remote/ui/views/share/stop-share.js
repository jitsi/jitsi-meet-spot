import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getInMeetingStatus } from 'common/app-state';
import { ScreenShare } from 'common/icons';
import { LoadingIcon, RoomName, View } from 'common/ui';
import { parseMeetingUrl } from 'common/utils';

import { NavButton } from './../../components';

/**
 * Displays a button for stopping wireless screenshare in progress.
 *
 * @extends React.Component
 */
export class StopShare extends React.Component {
    static propTypes = {
        inMeeting: PropTypes.string,
        onStopScreenshare: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (!this.props.inMeeting) {
            return <LoadingIcon />;
        }

        const { host, meetingName, path } = parseMeetingUrl(this.props.inMeeting);

        return (
            <View name = 'stop-share'>
                <div
                    className = 'stop-share'
                    data-qa-id = 'stop-share'>
                    <div className = 'view-header'>
                        <RoomName />
                        <div className = 'in-call-name'>
                            { meetingName }
                        </div>
                        <div className = 'in-call-meeting-url' >
                            { `${host}${path}/${meetingName}` }
                        </div>
                    </div>
                    <div className = 'stop-share-button-container'>
                        <NavButton
                            className = 'sharebutton active'
                            label = 'Stop sharing'
                            onClick = { this.props.onStopScreenshare }
                            qaId = 'stop-share-button'>
                            <ScreenShare />
                        </NavButton>
                    </div>
                </div>
            </View>
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
    const {
        inMeeting
    } = getInMeetingStatus(state);

    return {
        inMeeting
    };
}

export default connect(mapStateToProps)(StopShare);
