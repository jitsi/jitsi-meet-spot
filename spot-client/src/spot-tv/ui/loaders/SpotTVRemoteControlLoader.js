import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { analytics } from 'common/analytics';
import {
    isConnectionEstablished,
    isConnectionPending,
    setIsSpot
} from 'common/app-state';
import { remoteControlServer } from 'common/remote-control';
import { Loading } from 'common/ui';

import {
    createSpotTVRemoteControlConnection
} from './../../app-state';


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
        isAttemptingConnection: PropTypes.bool,
        isBackendEnabled: PropTypes.bool,
        isConnected: PropTypes.bool
    };

    /**
     * Configures analytics to report events as a Spot-TV and starts the
     * connection for the remote control server for sending sending updates and
     * receiving commands.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.dispatch(setIsSpot(true));

        analytics.updateProperty('spot-tv', true);

        if (!this.props.isConnected && !this.props.isAttemptingConnection) {
            // In the no backend mode the connection logic loops forever, because as long as there are
            // no network/config problems the connection must succeed.
            this.props.dispatch(createSpotTVRemoteControlConnection({ retry: true }));
        }
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
            remoteControlServer
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
        isAttemptingConnection: isConnectionPending(state),
        isConnected: isConnectionEstablished(state)
    };
}

export default connect(mapStateToProps)(SpotTVRemoteControlLoader);
