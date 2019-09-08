import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { VolumeButton } from '../remote-control-menu';

/**
 * Implements a modal to adjust the volume of the spot tv remotely.
 */
export class VolumeModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        t: PropTypes.func
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
                            { this.props.t('commands.volume') }
                        </span>
                        <VolumeButton type = 'down' />
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(VolumeModal);
