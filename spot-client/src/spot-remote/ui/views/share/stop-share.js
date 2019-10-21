import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { getInMeetingStatus } from 'common/app-state';
import { ScreenShare } from 'common/icons';
import { Button, LoadingIcon } from 'common/ui';

/**
 * Displays a button for stopping wireless screenshare in progress.
 *
 * @extends React.Component
 */
export class StopShare extends React.Component {
    static propTypes = {
        inMeeting: PropTypes.string,
        onStopScreenshare: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            inMeeting,
            onStopScreenshare,
            t
        } = this.props;

        if (!inMeeting) {
            return <LoadingIcon />;
        }

        return (
            <div
                className = 'stop-share'
                data-qa-id = 'stop-share'>
                <div className = 'stop-share-title'>
                    { t('screenshare.isSharingScreen') }
                </div>
                <div className = 'stop-share-icon'>
                    <ScreenShare />
                </div>
                <Button
                    className = 'stop-share-button'
                    onClick = { onStopScreenshare }
                    qaId = 'stop-share-button'>
                    { t('screenshare.stopSharing') }
                </Button>
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
    const {
        inMeeting
    } = getInMeetingStatus(state);

    return {
        inMeeting
    };
}

export default connect(mapStateToProps)(withTranslation()(StopShare));
