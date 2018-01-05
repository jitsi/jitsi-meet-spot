import moment from 'moment';
import React from 'react';

import styles from './clock.css';

export default class Clock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            time: this._getFormattedCurrentTime()
        };

        this._dateUpdateInterval = null;
    }

    componentDidMount() {
        this._dateUpdateInterval = setInterval(() => {
            this.setState({ time: this._getFormattedCurrentTime() })
        }, 500);
    }

    componentWillUnmount() {
        clearInterval(this._dateUpdateInterval);
    }

    render() {
        return (
            <div className = { styles.clock }>
                { this.state.time }
            </div>
        );
    }

    _getFormattedCurrentTime() {
        return moment().format('hh:mm');
    }
}
