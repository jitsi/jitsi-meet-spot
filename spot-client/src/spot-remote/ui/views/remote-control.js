import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import {
    getCalendarEvents,
    getCurrentView,
    isConnectedToSpot,
    isConnectionEstablished
} from 'common/app-state';
import { logger } from 'common/logger';
import { LoadingIcon, View } from 'common/ui';

import './../../analytics';

import {
    ElectronDesktopPickerModal,
    WaitingForSpotTVOverlay
} from './../components';
import { WithRemoteControl, withUltrasound } from './../loaders';
import { Feedback, InCall, WaitingForCall } from './remote-views';

/**
 * Displays the remote control view for controlling a Spot-TV instance from an
 * instance of Spot-Remote. This view has sub-views for interacting with
 * Spot-TV in its different states.
 *
 * @extends React.PureComponent
 */
export class RemoteControl extends React.PureComponent {
    static propTypes = {
        events: PropTypes.array,
        history: PropTypes.object,
        isWaitingForSpotTV: PropTypes.bool,
        t: PropTypes.func,
        view: PropTypes.string
    };

    /**
     * Creates new instance of {@code RemoteControl} component.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props, true);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <View name = 'remoteControl'>
                <WithRemoteControl>
                    { this._getView() }
                    <ElectronDesktopPickerModal />
                </WithRemoteControl>
            </View>
        );
    }

    /**
     * A state machine which determines what content should be displayed
     * within the view.
     *
     * @private
     * @returns {ReactElement}
     */
    _getView() {
        if (this.props.isWaitingForSpotTV) {
            logger.log('remote-control show waiting for Spot TV');

            return <WaitingForSpotTVOverlay />;
        }

        // FIXME if those subview would subclass View we would also have analytics
        logger.log(`remote-control view: ${this.props.view}`);

        switch (this.props.view) {
        case 'admin':
            return <div>currently in admin tools</div>;
        case 'feedback':
            return (
                <Feedback />
            );
        case 'home':
            return <WaitingForCall events = { this.props.events } />;
        case 'meeting':
            return <InCall />;
        case 'setup':
            return <div>{ this.props.t('appStatus.setup') }</div>;
        default:
            return <LoadingIcon />;
        }
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code RemoteControls}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        events: getCalendarEvents(state),
        view: getCurrentView(state),
        isWaitingForSpotTV: isConnectionEstablished(state) && !isConnectedToSpot(state)
    };
}

export default withUltrasound(
    connect(mapStateToProps)(
        withTranslation()(RemoteControl)
    )
);
