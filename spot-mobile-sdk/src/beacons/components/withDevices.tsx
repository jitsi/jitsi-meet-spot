import React, { PureComponent, ReactElement } from 'react';

import { Beacon } from '../../model';
import SpotSDK from '../../SpotSDK';

import { DEVICE_DETECTED_EVENT } from '../constants';

export interface WithDevicesProps {

    /**
     * List of nearby devices that this component needs to be aware of.
     */
    devicesNearby: Beacon[];
}

interface State {

    /**
     * List of nearby devices that this component needs to be aware of.
     */
    devicesNearby: Beacon[];
}

/**
 * HOC to give device detection functionality to components.
 */
export default function withDevices(WrappedComponent): PureComponent {
    // @ts-ignore: TS expects explicit overriding of properties
    return class DeviceAwareComponent extends PureComponent<any, State> {
        /**
         * Instantiates a new component.
         *
         * @inheritdoc
         */
        constructor(props) {
            super(props);

            this.state = {
                // Setting the currently available devices as the start state.
                // This is useful for components that get mounted after a device
                // is detected.
                devicesNearby: SpotSDK.deviceEventEmitter.devicesNearby || []
            };

            this.updateDeviceList = this.updateDeviceList.bind(this);
        }

        /**
         * Implements {@code PureComponent#componentDidMount}.
         *
         * @inheritdoc
         */
        public componentDidMount(): void {
            SpotSDK.addListener(DEVICE_DETECTED_EVENT, this.updateDeviceList);
        }

        /**
         * Implements {@code PureComponent#componentWillUnmount}.
         *
         * @inheritdoc
         */
        public componentWillUnmount(): void {
            SpotSDK.removeListener(DEVICE_DETECTED_EVENT, this.updateDeviceList);
        }

        /**
         * Implements {@code PureComponent#render}.
         *
         * @inheritdoc
         */
        public render(): ReactElement {
            return (
                <WrappedComponent
                    devicesNearby = { this.state.devicesNearby }
                    { ...this.props } />
            );
        }

        /**
         * Updates the device list that this component is aware of.
         *
         * @param {Beacon[]} devicesNearby - The list of devices recently detected.
         * @returns {void}
         */
        private updateDeviceList(devicesNearby: Beacon[]): void {
            this.setState({
                devicesNearby
            });
        }
    };
}
