import React from 'react';

import { date } from 'utils';

import styles from './clock.css';

export default class Clock extends React.Component {
    constructor(props) {
        super(props);

        this._dateUpdateInterval = null;

        this.state = {
            time: this._getTime()
        };
    }

    componentDidMount() {
        this._dateUpdateInterval = setInterval(() => {
            this.setState({ time: this._getTime() });
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

    _getTime() {
        return date.formatToTime(date.getCurrentDate());
    }
}
