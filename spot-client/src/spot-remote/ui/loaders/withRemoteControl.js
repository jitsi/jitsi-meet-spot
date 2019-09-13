import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { isConnectionEstablished } from 'common/app-state';
import { history } from 'common/history';
import { remoteControlClient } from 'common/remote-control';
import { ROUTES } from 'common/routing';
import { AbstractLoader, generateWrapper, Loading } from 'common/ui';

/**
 * Loads application services while displaying a loading icon. Will display
 * the passed-in children when loading is complete.
 *
 * @extends React.Component
 */
export class RemoteControlLoader extends AbstractLoader {
    static propTypes = {
        isConnected: PropTypes.bool
    };

    /**
     * Initializes a new {@code RemoteControlLoader} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props, 'SpotRemote');
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
     * @returns {ReactElement}
     */
    render() {
        if (!this.props.isConnected) {
            return <Loading />;
        }

        return super.render();
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code RemoteControlLoader}.
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

const ConnectedRemoteControlLoader = withRouter(RemoteControlLoader);

export default generateWrapper(connect(mapStateToProps)(ConnectedRemoteControlLoader));
