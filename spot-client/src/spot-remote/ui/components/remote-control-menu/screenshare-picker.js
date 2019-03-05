import PropTypes from 'prop-types';
import React from 'react';

import { NavButton } from './../nav';

/**
 * Displays an option to start wireless and wired screensharing.
 *
 * @extends React.Component
 */
export default class ScreensharePicker extends React.Component {
    static propTypes = {
        onStartWiredScreenshare: PropTypes.func,
        onStartWirelessScreenshare: PropTypes.func
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div>
                <div className = 'title'>
                    How would you like to screenshare?
                </div>
                <div className = 'options'>
                    <NavButton
                        className = 'screenshare'
                        iconName = 'wireless_screen_share'
                        label = 'Wireless Screensharing'
                        onClick = { this.props.onStartWirelessScreenshare } />
                    <NavButton
                        className = 'screenshare'
                        iconName = 'wired_screen_share'
                        label = 'HDMI Screensharing'
                        onClick = { this.props.onStartWiredScreenshare } />
                </div>
            </div>
        );
    }
}
