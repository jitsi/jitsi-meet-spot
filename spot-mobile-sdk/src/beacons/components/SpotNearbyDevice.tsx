import _ from 'lodash';
import React, { PureComponent, ReactElement } from 'react';
import { Text, View } from 'react-native';

import TVIcon from '../../../assets/tv-24px.svg';

import { Beacon } from '../../model';

import styles, { COMPONENT_COLOR, DEVICE_ICON_SIZE } from './styles';

interface Props {

    /**
     * The beacon representing the device to render.
     */
    beacon: Beacon;

    /**
     * The optional default name for an unknown device.
     */
    defaultName?: string;
}

/**
 * Internal component to render a single nearby device (beacon).
 */
export default class SpotNearbyDevice extends PureComponent<Props> {
    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    public render(): ReactElement {
        return (
            <View style = { styles.deviceLine }>
                <View style = { styles.iconContainer }>
                    <TVIcon
                        fill = { COMPONENT_COLOR }
                        height = { DEVICE_ICON_SIZE }
                        width = { DEVICE_ICON_SIZE } />
                </View>
                <View style = { styles.infoContainer }>
                    { this.renderDeviceInfo() }
                </View>
            </View>
        );
    }

    /**
     * Function to render the textual device info part of the component.
     *
     * @private
     * @returns {Array<ReactElement>}
     */
    private renderDeviceInfo(): ReactElement[] {
        const { beacon } = this.props;
        const joinCodeToDisplay = _.toUpper(beacon.joinCode);

        return [
            (
                <Text
                    key = { `name_${joinCodeToDisplay}` }
                    style = { [ styles.deviceInfoLine, styles.deviceInfoLine1 ] }>
                    { beacon.name }
                </Text>
            ),
            (
                <View
                    key = 'deviceInfoSeparator'
                    style = { styles.deviceInfoSeparator } />
            ),
            (
                <Text
                    key = { joinCodeToDisplay }
                    style = { [ styles.deviceInfoLine, styles.deviceInfoLine2 ] }>
                    { joinCodeToDisplay }
                </Text>
            )
        ];
    }
}
