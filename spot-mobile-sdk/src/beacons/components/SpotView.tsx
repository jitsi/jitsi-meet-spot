import React, { CSSProperties, PureComponent, ReactElement } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Beacon } from '../../model';
import SpotSDK from '../../SpotSDK';

import styles from './styles';

interface Props {

    /**
     * The device we want to control, if any. Otherwise a spot controller
     * is opened with the code entry screen to control a non beacon-enabled instance.
     */
    device?: Beacon;

    /**
     * Optional external style to be applied.
     */
    style?: CSSProperties;
}

/**
 * Publicly usable component to render a view that displays a spot controller.
 */
export default class SpotView extends PureComponent<Props> {
    /**
     * Instantiates a new component.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.renderLoading = this.renderLoading.bind(this);
    }

    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    public render(): ReactElement {
        const { device, style } = this.props;
        const uri = `${SpotSDK.config.baseURL}${device ? device.joinCode : ''}`;

        return (

            // @ts-ignore (TS thinks there is no style prop for the WebView for some reason)
            <WebView
                renderLoading = { this.renderLoading }
                source = {{ uri }}
                startInLoadingState = { true }
                style = { style } />
        );

    }

    /**
     * Function to render the default loading spinner if no external one is supplied.
     *
     * @private
     * @returns {ReactElement}
     */
    private renderLoading(): ReactElement {
        return (
            <View style = { styles.loadIndicatorWrapper }>
                <ActivityIndicator />
            </View>
        );
    }
}
