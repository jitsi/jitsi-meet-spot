import React, { CSSProperties, PureComponent, ReactElement } from 'react';
import { TouchableOpacity } from 'react-native';

import CastIcon from '../../../assets/cast-24px.svg';

import withDevices, { WithDevicesProps } from './withDevices';

interface Props extends WithDevicesProps {

    /**
     * Optional color for the icon.
     */
    iconColor?: string;

    /**
     * Optional size for the icon.
     */
    iconSize?: number;

    /**
     * Callback to be invoked when the button is pressed.
     */
    onPress?: () => void;

    /**
     * Optional external style to be applied.
     */
    style?: CSSProperties;
}

// The default color of the icon.
const DEFAULT_ICON_COLOR = 'white';

// The default size of the icon.
const DEFAULT_ICON_SIZE = 24;

/**
 * Publicly usable component to render a button that automatically appears when
 * nearby devices are detected.
 */
class SpotStreamButton extends PureComponent<Props> {

    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    public render(): ReactElement | null {
        const { devicesNearby, onPress, style } = this.props;

        if (!devicesNearby || !devicesNearby.length) {
            return null;
        }

        return (
            <TouchableOpacity
                onPress = { onPress }
                style = { style }>
                {
                    this.props.children || this.renderIcon()
                }
            </TouchableOpacity>
        );
    }

    /**
     * Function to render the default icon if no children are provided to the component.
     *
     * @private
     * @returns {ReactElement}
     */
    private renderIcon(): ReactElement {
        const { iconColor, iconSize } = this.props;

        return (
            <CastIcon
                fill = { iconColor || DEFAULT_ICON_COLOR }
                height = { iconSize || DEFAULT_ICON_SIZE }
                width = { iconSize || DEFAULT_ICON_SIZE } />
        );
    }
}

export default withDevices(SpotStreamButton);
