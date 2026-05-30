import {
    getInMeetingStatus,
    hideModal,
    isModalOpen,
    showModal,
    startWirelessScreensharing
} from 'common/app-state';
import { isWirelessScreenshareSupported } from 'common/detection';
import { ScreenShareOutlined } from 'common/icons';
import React from 'react';
import { connect } from 'react-redux';


import { NavButton } from './../nav';
import ScreenshareModal from './ScreenshareModal';

interface IProps {
    isScreenshareModalOpen?: boolean;
    onHideModal?: () => void;
    onShowScreenshareModal?: () => void;
    onStartWirelessScreenshare?: () => void;
    onWillOpenModal?: (...args: any[]) => void;
    screensharingType?: string;
    wiredScreensharingEnabled?: boolean;
}

/**
 * A component for displaying and hiding {@code ScreenshareModal}.
 */
export class ScreenshareButton extends React.Component<IProps> {
    _isWirelessScreenshareSupported: boolean;

    /**
     * Initializes a new {@code ScreenshareButton} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this._isWirelessScreenshareSupported = isWirelessScreenshareSupported();

        this._onToggleScreenshare = this._onToggleScreenshare.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { screensharingType } = this.props;
        const screenshareButtonStyles = `sharebutton ${screensharingType
            ? 'active' : ''}`;

        return (
            <NavButton
                className = { screenshareButtonStyles }
                onClick = { this._onToggleScreenshare }
                qaId = { screensharingType ? 'stop-share-button' : 'start-share-button' }
                subIcon = { this._renderScreenshareSubIcon() }>
                <ScreenShareOutlined />
            </NavButton>
        );
    }

    /**
     * Callback invoked when the screenshare button is clicked to either open
     * the modal or close it.
     *
     * @private
     * @returns {void}
     */
    _onToggleScreenshare() {
        if (this.props.isScreenshareModalOpen) {
            this.props.onHideModal?.();

            return;
        }

        // If only wireless sceensharing is available and there is no
        // screenshare occurring, then start the wireless screensharing flow.
        if (this._isWirelessScreenshareSupported
            && !this.props.wiredScreensharingEnabled
            && !this.props.screensharingType) {
            this.props.onStartWirelessScreenshare?.();

            return;
        }

        this.props.onShowScreenshareModal?.();
    }

    /**
     * Renders the element on the screenshare button which shows screenshare is
     * active.
     *
     * @private
     * @returns {ReactElement|null}
     */
    _renderScreenshareSubIcon() {
        return this.props.screensharingType
            ? <div className = 'on-indicator' />
            : null;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code ScreenshareButton}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
    const {
        screensharingType,
        wiredScreensharingEnabled
    } = getInMeetingStatus(state);

    return {
        isScreenshareModalOpen: isModalOpen(state, ScreenshareModal),
        screensharingType,
        wiredScreensharingEnabled
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        /**
         * Stop displaying all modals.
         *
         * @returns {void}
         */
        onHideModal() {
            dispatch(hideModal());
        },

        /**
         * Displays the {@code ScreenshareModal} to interact with wired and/or
         * wireless screensharing.
         *
         * @returns {void}
         */
        onShowScreenshareModal() {
            dispatch(showModal(ScreenshareModal));
        },

        /**
         * Triggers the wireless screensharing flow to be started.
         *
         * @returns {Promise}
         */
        onStartWirelessScreenshare() {
            return dispatch(startWirelessScreensharing());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ScreenshareButton);
