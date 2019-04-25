import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { analytics } from 'common/analytics';
import {
    isConnectionEstablished,
    setIsSpot
} from 'common/app-state';
import { remoteControlService } from 'common/remote-control';
import { Loading } from 'common/ui';

import { createSpotTVRemoteControlConnection } from './../../app-state';

/**
 * Loads application services while displaying a loading icon. Will display
 * the passed-in children when loading is complete.
 *
 * @extends React.Component
 */
export class SpotTVRemoteControlLoader extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        dispatch: PropTypes.func,
        isConnected: PropTypes.bool
    };

    /**
     * Configures analytics to report events as a Spot-TV.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.dispatch(setIsSpot(true));

        analytics.updateProperty('spot-tv', true);

        // TODO: Add some retry logic to error handling for when the initial
        // connection fails to be established.
        this.props.dispatch(createSpotTVRemoteControlConnection());
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (this.props.isConnected) {
            const { children } = this.props;
            const childProps = this._getPropsForChildren();

            return React.Children.map(children, child =>
                React.cloneElement(child, childProps));
        }

        return <Loading />;
    }

    /**
     * Returns the props that should be passed into this loader's child
     * elements.
     *
     * @override
     */
    _getPropsForChildren() {
        return {
            remoteControlService
        };
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code SpotTVRemoteControlLoader}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isConnected: isConnectionEstablished(state)
    };
}

export default connect(mapStateToProps)(SpotTVRemoteControlLoader);
