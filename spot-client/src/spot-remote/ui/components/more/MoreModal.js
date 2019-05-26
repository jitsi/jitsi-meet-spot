import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { hideModal, isVolumeControlSupported } from 'common/app-state';

import { VolumeUp } from 'common/icons';
import { Modal } from 'common/ui';

import { NavButton } from './../nav';

import TileViewButton from './TileViewButton';
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
            showVolumeModal: false
        };

        this._onToggleVolumeModal = this._onToggleVolumeModal.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (this.state.showVolumeModal) {
            return (
                <VolumeModal
                    onClose = { this._onToggleVolumeModal } />
            );
        }

        return (
            <Modal
                onClose = { this.props.onClose }
                qaId = 'more-modal'>
                <div className = 'more-modal'>
                    <TileViewButton />
                    {
                        this.props.supportsVolumeControl && (
                            <NavButton
                                label = 'Volume control'
                                onClick = { this._onToggleVolumeModal }
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
     * Toggles the volume modal.
     *
     * @returns {void}
     */
    _onToggleVolumeModal() {
        this.setState({
            showVolumeModal: !this.state.showVolumeModal
        });
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
