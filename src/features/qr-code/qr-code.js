import PropTypes from 'prop-types';
import React from 'react';

import { IdleCursorDetector } from 'features/idle-cursor-detector';

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

    state = {
        isCursorIdle: true
    };

    /**
     * Initializes a new {@code QRCode} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onCursorIdleChange = this._onCursorIdleChange.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        let content;

        if (this.state.isCursorIdle) {
            content = null;
        } else {
            const { height, width, text } = this.props;
            const encodedText = window.encodeURIComponent(text);
            const qrCodeUrl = `https://chart.googleapis.com/chart?chs=${
                height}x${width}&cht=qr&chl=${encodedText}`;

            content = <img src = { qrCodeUrl } />;
        }

        return (
            <IdleCursorDetector
                onCursorIdleChange = { this._onCursorIdleChange }>
                { content }
            </IdleCursorDetector>
        );
    }

    /**
     * Callback invoked to update the known idle state of the cursor.
     *
     * @param {boolean} isCursorIdle - Whether or not the cursor is idle.
     * @private
     * @returns {void}
     */
    _onCursorIdleChange(isCursorIdle) {
        this.setState({
            isCursorIdle
        });
    }
}
