import PropTypes from 'prop-types';
import React from 'react';

import { VolumeButton } from '../../components/remote-control-menu';

/**
 * Implements a modal to adjust the volume of the spot tv remotely.
 */
export default class VolumeModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func
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
                        onClick = { this.props.onClose }
                        type = 'button'>
                        x
                    </button>
                    <div className = 'volume-modal'>
                        <VolumeButton type = 'up' />
                        <span>
                            Volume
                        </span>
                        <VolumeButton type = 'down' />
                    </div>
                </div>
            </div>
        );
    }
}
