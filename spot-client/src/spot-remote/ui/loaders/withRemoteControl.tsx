
import type { RootState } from 'common/app-state';
import { isConnectionEstablished } from 'common/app-state';
import { history } from 'common/history';
import { remoteControlClient } from 'common/remote-control';
import { ROUTES } from 'common/routing';
import { AbstractLoader, Loading } from 'common/ui';
import React from 'react';
import { connect } from 'react-redux';

import { disconnectFromSpotTV } from '../../app-state';

/**
 * The props of {@code RemoteControlLoader}.
 */
interface IProps {

    /**
     * The elements to render once the service has loaded.
     */
    children?: any;

    /**
     * Whether or not the connection to the Spot-TV should be terminated when
     * the component is unmounted.
     */
    disconnectOnUnmount?: boolean;

    /**
     * Whether or not there is a connection to a Spot-TV.
     */
    isConnected?: boolean;

    /**
     * Whether or not a connection is being re-established.
     */
    isReconnecting?: boolean;

    /**
     * Callback invoked to stop any existing connection to a Spot-TV.
     */
    onDisconnect?: () => void;
}

/**
 * Loads application services while displaying a loading icon. Will display
 * the passed-in children when loading is complete.
 */
export class RemoteControlLoader extends AbstractLoader<IProps> {
    static defaultProps = {
        disconnectOnUnmount: true
    };

    /**
     * Initializes a new {@code RemoteControlLoader} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props, 'SpotRemote');
    }

    /**
     * Clean up connection related state.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        if (this.props.disconnectOnUnmount) {
            this.props.onDisconnect?.();
        }
    }

    /**
     * Returns the props that should be passed into this loader's child
     * elements.
     *
     * @override
     */
    _getPropsForChildren() {
        return {
            remoteControlClient
        };
    }

    /**
     * Establishes the connection to the remote control service.
     *
     * @override
     */
    _loadService() {
        const connectPromise = remoteControlClient.getConnectPromise();

        if (connectPromise) {
            return connectPromise;
        }

        // Redirect to the join code entry page
        history.push(ROUTES.CODE);

        return Promise.reject('The connection must be started by the join code entry page');
    }

    /**
     * Overrides render method to show the loading indicator if RCS is not connected.
     *
     * @inheritdoc
     */
    render() {
        if (!this.props.isConnected) {
            return <Loading />;
        }

        return super.render();
    }
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 */
function mapDispatchToProps(dispatch: any) {
    return {
        /**
         * Stop any existing connection to a Spot-TV.
         *
         * @returns {void}
         */
        onDisconnect() {
            dispatch(disconnectFromSpotTV());
        }
    };
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code RemoteControlLoader}.
 *
 * @param state - The Redux state.
 * @private
 */
function mapStateToProps(state: RootState) {
    return {
        isConnected: isConnectionEstablished(state)
    };
}

// Cast to a component type that accepts `children`: react-redux 9's `connect` infers empty
// own-props from the `as any` wrapped component and so would otherwise reject the children
// passed by `<WithRemoteControl>...</WithRemoteControl>` (see remote-control.tsx).
export default connect(mapStateToProps, mapDispatchToProps)(
    RemoteControlLoader as any
) as React.ComponentType<IProps>;
