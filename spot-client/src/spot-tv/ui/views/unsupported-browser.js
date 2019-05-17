import React from 'react';

/**
 * Displays a message stating the current browser cannot be used for Spot-TV.
 *
 * @extends React.Component
 */
export default class UnsupportedBrowser extends React.Component {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'unsupported-browser'>
                <div>Hosting a Spot is not supported on the current browser.</div>
                <div>Please open Spot on Chrome desktop.</div>
            </div>
        );
    }
}
