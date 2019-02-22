import PropTypes from 'prop-types';
import React from 'react';

import { View } from 'common/ui';

import { JoinInfo } from './../components';

/**
 * A React Component representing a single screen in the Spot client. Wraps
 * {@code View} to include notifying remotes of the current displayed view.
 *
 * @extends React.Component
 */
class SpotView extends React.Component {
    static propTypes = {
        children: PropTypes.any,
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
        this._updateCurrentViewStatus(this.props.name);
    }

    /**
     * Updates the {@code remoteControlService} with the currently displayed
     * viewed name.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (prevProps.name !== this.props.name) {
            this._updateCurrentViewStatus(this.props.name);
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { children } = this.props;
        const childComponents = React.Children.map(children, child =>
            React.cloneElement(
                child,
                { remoteControlService: this.props.remoteControlService }
            ));

        return (
            <View { ...this.props }>
                { childComponents }
                <JoinInfo />
            </View>
        );
    }

    /**
     * Helper for informing remote controls of the current view displays on
     * the Spot-TV.
     *
     * @param {string} name - The name of the current view.
     * @private
     * @returns {void}
     */
    _updateCurrentViewStatus(name) {
        this.props.remoteControlService.notifyViewStatus(name);
    }
}

export default SpotView;
