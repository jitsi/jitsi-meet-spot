import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    isConnectionEstablished,
    setIsSpot
} from 'common/app-state';
import { remoteControlService } from 'common/remote-control';

import Loading from './loading';

/**
 * Displays a loading indicator while {@code remoteControlService} does not
 * have an active connection, thereby preventing children from being interacted
 * with to call into {@code remoteControlService}.
 *
 * @extends React.Component
 */
export class RemoteControlServiceLoading extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        dispatch: PropTypes.func,
        isConnected: PropTypes.bool,
        isSpot: PropTypes.bool
    };

    /**
     * Notifies the rest of the app that this client instance is a Spot-TV.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (this.props.isSpot) {
            this.props.dispatch(setIsSpot(true));
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
            remoteControlService
        };
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code RemoteControlServiceLoading}.
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

export default connect(mapStateToProps)(RemoteControlServiceLoading);
