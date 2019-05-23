import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getInMeetingStatus,
    hideModal,
    startWiredScreensharing,
    startWirelessScreensharing,
    stopScreenshare
} from 'common/app-state';
import { isWirelessScreenshareSupported } from 'common/utils';

import { ScreensharePicker } from './../../components';

/**
 * Wraps {@code ScreensharePicker} so it can be displayed in a modal.
 *
 * @extends React.Component
 */
export class ScreenshareModal extends React.Component {
    static propTypes = {
        onHideModal: PropTypes.func,
        onStartWiredScreenshare: PropTypes.func,
        onStartWirelessScreenshare: PropTypes.func,
        onStopScreensharing: PropTypes.func,
        screensharingType: PropTypes.string,
        wiredScreensharingEnabled: PropTypes.bool
    };

    /**
     * Initializes a new {@code ScreenshareModal} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onStopScreenshare = this._onStopScreenshare.bind(this);
        this._isWirelessScreenshareSupported = isWirelessScreenshareSupported();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'modal'>
                <div className = 'modal-shroud' />
                <div className = 'modal-content'>
                    <button
                        className = 'close'
                        onClick = { this.props.onHideModal }
                        type = 'button'>
                        x
                    </button>
                    <div className = 'share-select-view'>
                        <ScreensharePicker
                            onStartWiredScreenshare
                                = { this.props.onStartWiredScreenshare }
                            onStartWirelessScreenshare
                                = { this.props.onStartWirelessScreenshare }
                            onStopScreensharing
                                = { this._onStopScreenshare }
                            screensharingType = { this.props.screensharingType }
                            wiredScreenshareEnabled
                                = { this.props.wiredScreensharingEnabled }
                            wirelessScreenshareEnabled
                                = { this._isWirelessScreenshareSupported } />
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Turns off any active screenshare.
     *
     * @private
     * @returns {void}
     */
    _onStopScreenshare() {
        this.props.onStopScreensharing()
            .then(() => {
                // Special case to immediately close the modal when stopping
                // screenshare while only wireless screenshare is available.
                if (this._isWirelessScreenshareSupported
                    && !this.props.wiredScreensharingEnabled) {
                    this.props.onHideModal();
                }
            });
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code ScreenshareModal}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const {
        screensharingType,
        wiredScreensharingEnabled
    } = getInMeetingStatus(state);

    return {
        screensharingType,
        wiredScreensharingEnabled
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
         * Sets the {@code ScreenshareModal} to be hidden.
         *
         * @returns {void}
         */
        onHideModal() {
            dispatch(hideModal());
        },

        /**
         * Triggers the wireless screensharing flow to be started.
         *
         * @returns {Promise}
         */
        onStartWirelessScreenshare() {
            return dispatch(startWirelessScreensharing());
        },

        /**
         * Triggers wired screensharing to be enabled.
         *
         * @returns {void}
         */
        onStartWiredScreenshare() {
            dispatch(startWiredScreensharing());
        },

        /**
         * Turns off any active screenshare.
         *
         * @returns {Promise}
         */
        onStopScreensharing() {
            return dispatch(stopScreenshare());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ScreenshareModal);
