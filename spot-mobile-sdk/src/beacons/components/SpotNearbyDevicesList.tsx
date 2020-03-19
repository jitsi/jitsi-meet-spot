import React, { CSSProperties, PureComponent, ReactElement } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';

import { Beacon } from '../../model';

import SpotNearbyDevice from './SpotNearbyDevice';
import withDevices, { WithDevicesProps } from './withDevices';

interface Props extends WithDevicesProps {

    /**
     * The optional default name for an unknown device.
     */
    defaultDeviceName?: string;

    /**
     * The callback to be invoked on selecting a device from the list.
     */
    onSelect?: (beacon: Beacon) => void;

    /**
     * Optional external style to be applied.
     */
    style?: CSSProperties;
}

/**
 * Publicly usable component to render a list of nearby devices.
 */
class SpotNearbyDevicesList extends PureComponent<Props> {
    /**
     * Instantiates a new component.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.keyExtractor = this.keyExtractor.bind(this);
        this.renderItem = this.renderItem.bind(this);
    }

    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    public render(): ReactElement {
        return (
            <View style = { this.props.style }>
                <FlatList
                    data = { this.props.devicesNearby }
                    keyExtractor = { this.keyExtractor }
                    renderItem = { this.renderItem }/>
            </View>
        );
    }

    /**
     * Function to generater a unique dom key for a list item.
     *
     * @private
     * @param {Beacon} item - The item to generater a key for.
     * @returns {string}
     */
    private keyExtractor(item: Beacon): string {
        return item.joinCode;
    }

    /**
     * Function to generate to be invoked on pressing an item in the list.
     *
     * @private
     * @param {Beacon} beacon - The selected beacon.
     * @returns {Function}
     */
    private onPress(beacon: Beacon): () => void {
        const { onSelect } = this.props;

        return (): void => {
            onSelect && onSelect(beacon);
        };
    }

    /**
     * Function to render a single item in the list.
     *
     * @private
     * @param {Object} flatListItem - The item to render.
     * @returns {ReactElement}
     */
    private renderItem({ item, index }): ReactElement {
        return (
            <TouchableOpacity
                key = { index }
                onPress = { this.onPress(item) }>
                <SpotNearbyDevice
                    beacon = { item }
                    defaultName = { this.props.defaultDeviceName } />
            </TouchableOpacity>
        );
    }
}

export default withDevices(SpotNearbyDevicesList);
