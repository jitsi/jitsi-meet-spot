
import type { RootState } from 'common/app-state';
import { analytics } from 'common/analytics';
import {
    isConnectionEstablished,
    isConnectionPending,
    isReconnecting,
    setIsSpot
} from 'common/app-state';
import { getPermanentPairingCode, isBackendEnabled } from 'common/backend';
import { logger } from 'common/logger';
import { remoteControlServer } from 'common/remote-control';
import { Loading } from 'common/ui';
import React from 'react';
import { connect } from 'react-redux';

import {
    createSpotTVRemoteControlConnection
} from './../../app-state';

interface IProps {
    children?: any;
    dispatch: (action: any) => any;
    isAttemptingConnection?: boolean;
    isBackendEnabled?: boolean;
    isConnected?: boolean;
    isReconnecting?: boolean;
    permanentPairingCode?: string;
}

/**
 * Loads application services while displaying a loading icon. Will display
 * the passed-in children when loading is complete.
 */
export class SpotTVRemoteControlLoader extends React.Component<IProps> {
    /**
     * Configures analytics to report events as a Spot-TV and starts the
     * connection for the remote control server for sending sending updates and
     * receiving commands.
     *
     * @inheritdoc
     */
    componentDidMount() {
        const { permanentPairingCode } = this.props;

        this.props.dispatch(setIsSpot(true));

        analytics.updateProperty('spot-tv', true);

        if (!this.props.isConnected && !this.props.isAttemptingConnection) {
            if (!this.props.isBackendEnabled) {
                // In the no backend mode the connection logic loops forever, because as long as there are
                // no network/config problems the connection must succeed.
                this.props.dispatch(createSpotTVRemoteControlConnection({ retry: true }));
            } else if (permanentPairingCode) {
                logger.log('Restored permanent pairing code', { permanentPairingCode });

                this.props.dispatch(
                    createSpotTVRemoteControlConnection({
                        pairingCode: permanentPairingCode,
                        retry: true
                    })
                );
            }
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (!this.props.isConnected && !this.props.isReconnecting) {
            return <Loading />;
        }

        const { children } = this.props;
        const childProps = this._getPropsForChildren();

        return React.Children.map(children, child =>
            React.cloneElement(child, childProps));
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
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        isAttemptingConnection: isConnectionPending(state),
        isBackendEnabled: isBackendEnabled(state),
        isConnected: isConnectionEstablished(state),
        isReconnecting: isReconnecting(state),
        permanentPairingCode: getPermanentPairingCode(state)
    };
}

export default connect(mapStateToProps)(SpotTVRemoteControlLoader);
