import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { hideModal, isVolumeControlSupported } from 'common/app-state';

import { VolumeUp } from 'common/icons';
import { Modal } from 'common/ui';

import { DTMFButton, DTMFModal } from './../dtmf';
import { TileViewButton } from './../remote-control-menu';
import { NavButton } from './../nav';

import VolumeModal from './VolumeModal';

/**
 * Implements a modal to show some more buttons that are probably less often used as the main ones on the screen.
 */
export class MoreModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        supportsVolumeControl: PropTypes.bool
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
                                label = 'Volume control'
                                onClick = { this._onShowVolumeMenu }
                                qaId = 'volume'>
                                <VolumeUp />
                            </NavButton>
                        )
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

export default connect(mapStateToProps, mapDispatchToProps)(MoreModal);
