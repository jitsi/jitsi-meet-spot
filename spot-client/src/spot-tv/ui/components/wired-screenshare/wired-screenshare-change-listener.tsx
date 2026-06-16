import type { RootState } from 'common/app-state';
import { isDeviceConnectedForWiredScreensharing } from 'common/app-state';
import React from 'react';
import { connect } from 'react-redux';


interface IProps {
    children?: any;
    hasScreenshareDevice?: boolean;
    onDeviceConnected?: (...args: any[]) => void;
    onDeviceDisconnected?: (...args: any[]) => void;
}

/**
 * A wrapper component for responding to a screenshare input device connecting
 * and redirecting to a meeting with screensharing.
 */
export class WiredScreenshareChangeListener extends React.PureComponent<IProps> {
    /**
     * Updates the listener for wired screensharing input changes.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps: IProps) {
        if (!prevProps.hasScreenshareDevice
            && this.props.hasScreenshareDevice
            && this.props.onDeviceConnected) {
            this.props.onDeviceConnected();
        }

        if (prevProps.hasScreenshareDevice
            && !this.props.hasScreenshareDevice
            && this.props.onDeviceDisconnected) {
            this.props.onDeviceDisconnected();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return this.props.children || null;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code WiredScreenshareRedirector}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        hasScreenshareDevice: isDeviceConnectedForWiredScreensharing(state)
    };
}

export default connect(mapStateToProps)(WiredScreenshareChangeListener);
