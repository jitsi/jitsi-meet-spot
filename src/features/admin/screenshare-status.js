import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getScreenshareDevice } from 'reducers';

/**
 * A component to display the current video input device that should be used
 * when screensharing during a meeting through a physical connection to Spot.
 *
 * @extends ReactElement.Component
 */
export class ScreenshareStatus extends React.Component {
    static propTypes = {
        device: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div>
                <div>Selected video input device for screensharing:</div>
                <div>
                    { this.props.device || 'screenshare dongle disabled' }
                </div>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code ScreenshareStatus}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        device: getScreenshareDevice(state)
    };
}
export default connect(mapStateToProps)(ScreenshareStatus);
