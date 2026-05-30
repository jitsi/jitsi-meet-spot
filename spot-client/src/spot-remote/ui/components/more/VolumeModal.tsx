import React from 'react';
import { withTranslation } from 'react-i18next';

import { VolumeButton } from '../remote-control-menu';

/**
 * The type of the React {@code Component} props of {@link VolumeModal}.
 */
interface IProps {

    /**
     * Callback to invoke when the modal should be closed.
     */
    onClose?: (...args: any[]) => void;

    /**
     * Callback to invoke to translate strings.
     */
    t?: (key: string) => string;
}

/**
 * Implements a modal to adjust the volume of the spot tv remotely.
 */
export class VolumeModal extends React.Component<IProps> {
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
                    <div className = 'volume-modal'>
                        <VolumeButton type = 'up' />
                        <span>
                            { this.props.t?.('commands.volume') }
                        </span>
                        <VolumeButton type = 'down' />
                    </div>
                    <button
                        className = 'close'
                        onClick = { this.props.onClose }
                        type = 'button'>
                        x
                    </button>
                </div>
            </div>
        );
    }
}

export default withTranslation()(VolumeModal);
