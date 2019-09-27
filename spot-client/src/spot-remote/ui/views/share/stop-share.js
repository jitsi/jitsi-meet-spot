import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getInMeetingStatus } from 'common/app-state';
import { ScreenShare } from 'common/icons';
import { LoadingIcon, View } from 'common/ui';

import { MeetingHeader, NavButton } from './../../components';

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

        return (
            <View name = 'stop-share'>
                <div
                    className = 'stop-share'
                    data-qa-id = 'stop-share'>
                    <MeetingHeader meetingUrl = { this.props.inMeeting } />
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
