import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import {
    hideModal,
    isInviteEnabled,
    isVolumeControlSupported
} from 'common/app-state';

import { VolumeUp } from 'common/icons';
import { Modal } from 'common/ui';

import { DTMFButton, DTMFModal } from './../dtmf';
import { InviteButton, InviteModal } from './../invite';
import { TileViewButton } from './../remote-control-menu';
import { NavButton } from './../nav';

import VolumeModal from './VolumeModal';

/**
 * Implements a modal to show some more buttons that are probably less often used as the main ones on the screen.
 */
export class MoreModal extends React.Component {
    static propTypes = {
        enableInvite: PropTypes.bool,
        onClose: PropTypes.func,
        supportsDtmf: PropTypes.bool,
        supportsVolumeControl: PropTypes.bool,
        t: PropTypes.func
    };

    /**
     * Instantiates a new {@code Component}.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this.state = {
            modalToDisplay: 'more'
        };

        this._onShowMoreMenu = this._onShowMoreMenu.bind(this);
        this._onShowDtmfModal = this._onShowDtmfModal.bind(this);
        this._onShowInvites = this._onShowInvites.bind(this);
        this._onShowVolumeMenu = this._onShowVolumeMenu.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        switch (this.state.modalToDisplay) {
        case 'invite':
            return <InviteModal onClose = { this._onShowMoreMenu } />;
        case 'volume':
            return <VolumeModal onClose = { this._onShowMoreMenu } />;
        case 'dtmf':
            return <DTMFModal onClose = { this._onShowMoreMenu } />;
        }

        return (
            <Modal
                onClose = { this.props.onClose }
                qaId = 'more-modal'>
                <div className = 'more-modal'>
                    <TileViewButton />
                    <DTMFButton onClick = { this._onShowDtmfModal } />
                    {
                        this.props.supportsVolumeControl && (
                            <NavButton
                                label = { this.props.t('commands.volume') }
                                onClick = { this._onShowVolumeMenu }
                                qaId = 'volume'>
                                <VolumeUp />
                            </NavButton>
                        )
                    }
                    {
                        this.props.enableInvite
                            && <InviteButton onClick = { this._onShowInvites } />
                    }
                </div>
            </Modal>
        );
    }

    /**
     * Displays the DTMF modal.
     *
     * @returns {void}
     */
    _onShowDtmfModal() {
        this.setState({ modalToDisplay: 'dtmf' });
    }

    /**
     * Displays the invite modal.
     *
     * @returns {void}
     */
    _onShowInvites() {
        this.setState({ modalToDisplay: 'invite' });
    }

    /**
     * Displays the default modal state, which has buttons to all features
     * within {@code MoreModal}.
     *
     * @returns {void}
     */
    _onShowMoreMenu() {
        this.setState({ modalToDisplay: 'more' });
    }

    /**
     * Displays the volume modal.
     *
     * @returns {void}
     */
    _onShowVolumeMenu() {
        this.setState({ modalToDisplay: 'volume' });
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code MoreModal}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        enableInvite: isInviteEnabled(state),
        supportsVolumeControl: isVolumeControlSupported(state)
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
         * Stop showing the {@code MoreModal}.
         *
         * @returns {void}
         */
        onClose() {
            dispatch(hideModal());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(MoreModal)
);
