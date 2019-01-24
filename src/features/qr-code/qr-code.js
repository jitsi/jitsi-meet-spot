import PropTypes from 'prop-types';
import React from 'react';

/**
 * A component for generating and displaying a QR code for passed in text.
 *
 * @extends React.Component
 */
export default class QRCode extends React.Component {
    static defaultProps = {
        height: 150,
        text: '',
        width: 150
    };

    static propTypes = {
        height: PropTypes.number,
        text: PropTypes.string,
        width: PropTypes.number
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { height, width, text } = this.props;
        const encodedText = window.encodeURIComponent(text);
        const qrCodeUrl = `https://chart.googleapis.com/chart?chs=${
            height}x${width}&cht=qr&chl=${encodedText}`;

        return <img src = { qrCodeUrl } />;
    }
}
