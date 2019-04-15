import PropTypes from 'prop-types';
import React from 'react';

import { ScreenShare } from 'common/icons';
import { NavButton } from './../../components';

/**
 * Displays a button for stopping wireless screenshare in progress.
 *
 * @extends React.Component
 */
export class StopShare extends React.Component {
    static propTypes = {
        onStopScreenshare: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div
                className = 'mode-select'
                data-qa-id = 'stop-share'>
                <div className = 'selections'>
                    <div className = 'selection'>
                        <NavButton
                            className = 'sharebutton active'
                            label = 'Stop sharing'
                            onClick = { this.props.onStopScreenshare }
                            qaId = 'stop-share-button'>
                            <ScreenShare />
                        </NavButton>
                    </div>
                </div>
            </div>
        );
    }
}

export default StopShare;
