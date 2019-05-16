import PropTypes from 'prop-types';
import React from 'react';

import { MenuButton } from '../../components/remote-control-menu';

import VolumeModal from './volume-modal';

/**
 * Implements a modal to show some more buttons that are probably less often used as the main ones on the screen.
 */
export default class MoreModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func
    }

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
            <div className = 'modal'>
                <div className = 'modal-shroud' />
                <div className = 'modal-content'>
                    <button
                        className = 'close'
                        onClick = { this.props.onClose }
                        type = 'button'>
                        x
                    </button>
                    <div className = 'more-modal'>
                        <MenuButton
                            label = 'Volume control'
                            onClick = { this._onToggleVolumeModal } />
                    </div>
                </div>
            </div>
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
