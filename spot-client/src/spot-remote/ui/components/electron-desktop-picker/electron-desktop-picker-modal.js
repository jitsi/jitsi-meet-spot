import React from 'react';

import { Modal } from 'common/ui';

import DesktopPicker from './desktop-picker';

/**
 * Modal for displaying the component {@code DesktopPicker}.
 *
 * @extends React.Component
 */
export default class ElectronDesktopPickerModal extends React.Component {
    /**
     * Initializes a new {@code ElectronDesktopPickerModal} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            onSourceChoose: null
        };

        this._onClose = this._onClose.bind(this);
    }

    /**
     * Sets the global variable required by lib-jitsi-meet for the screensharing
     * flow in Electron.
     *
     * @inheritdoc
     */
    componentDidMount() {
        window.JitsiMeetScreenObtainer = {
            openDesktopPicker: (options, onSourceChoose) => {
                this.setState({ onSourceChoose });
            }
        };
    }

    /**
     * Unsets the global variable required by lib-jitsi-meet.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        window.JitsiMeetScreenObtainer = undefined;
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (!this.state.onSourceChoose) {
            return null;
        }

        return (
            <Modal
                onClose = { this._onClose }
                rootClassName = 'electron-desktop-picker-modal'>
                <DesktopPicker
                    onCancel = { this._onClose }
                    onSelect = { this._onClose } />
            </Modal>
        );
    }

    /**
     * Callback invoked to submit DesktopCapturerSource information.
     *
     * @param {string} id - The id of the DesktopCapturerSource to pass into
     * the onSourceChoose callback.
     * @param {string} type - The type of the DesktopCapturerSource to pass into
     * the onSourceChoose callback.
     * @returns {void}
     */
    _onClose(id, type) {
        if (this.state.onSourceChoose) {
            this.state.onSourceChoose(id, type);
        }

        this.setState({ onSourceChoose: null });
    }
}
