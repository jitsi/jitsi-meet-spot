/* globals Quiet */

import PropTypes from 'prop-types';
import React from 'react';

import config from 'config';
import { Button } from 'features/button';

import styles from './styles.css';

const ultrasoundFilesDirectory = config.get('ultrasoundFilesDirectory');

export default class Transmitter extends React.Component {
    static propTypes = {
        hidden: PropTypes.bool,

        // TODO: implement updating of the existing interval if the prop updates
        interval: PropTypes.number,
        transmission: PropTypes.string
    };

    state = {
        showRetry: false
    };

    constructor(props) {
        super(props);

        this._startTransmitPolling = this._startTransmitPolling.bind(this);
        this._onTransmit = this._onTransmit.bind(this);
        this._onTransmitFinish = this._onTransmitFinish.bind(this);

        this._transmitInterval = null;
    }

    componentDidMount() {
        Quiet.init({
            profilesPrefix: ultrasoundFilesDirectory,
            memoryInitializerPrefix: ultrasoundFilesDirectory,
            libfecPrefix: ultrasoundFilesDirectory
        });

        Quiet.addReadyCallback(
            () => {
                this._transmitter = Quiet.transmitter({
                    profile: 'ultrasonic',
                    onFinish: this._onTransmitFinish
                });

                this._startTransmitPolling();

                this._onTransmit();
            },
            () => {
                this.setState({ showRetry: true });
            }
        );
    }

    componentWillUnmount() {
        clearInterval(this._transmitInterval);

        if (this.transmitter) {
            this._transmitter.destroy();
        }
    }

    render() {
        const className = this.props.hidden ? styles.hidden : '';

        return (
            <div className = { className }>
                { this.state.transmitte
                    ? <div>Transmitting</div>
                    : <Button onClick = { this._onTransmit }>
                        Transmit
                    </Button>}
            </div>
        );
    }

    _onTransmit() {
        if (this._transmitter) {
            this.setState({ transmitting: true }, () => {
                this._transmitter.transmit(
                    Quiet.str2ab(this.props.transmission));
            });
        }
    }

    _onTransmitFinish() {
        this.setState({ transmitting: false });
    }

    _startTransmitPolling() {
        this._transmitInterval = setInterval(() => {
            if (!this.state.transmitting) {
                this._onTransmit();
            }
        }, this.props.interval);
    }
}
