import PropTypes from 'prop-types';
import React from 'react';

import { asSpotLoader } from './loaders';
import View from './view';

/**
 * A React Component representing a single screen in the Spot client. Wraps
 * {@code View} to include notifying remotes of the current displayed view.
 *
 * @extends React.Component
 */
class SpotView extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        remoteControlService: PropTypes.object
    };

    /**
     * Updates the {@code remoteControlService} with the currently displayed
     * viewed name.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.remoteControlService.notifyViewStatus(this.props.name);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return <View { ...this.props } />;
    }
}

export default asSpotLoader(SpotView);
