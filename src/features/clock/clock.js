import React from 'react';

import styles from './clock.css';

export default class Clock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            date: new Date()
        };

        this._dateUpdateInterval = null;
    }

    componentDidMount() {
        this._dateUpdateInterval = setInterval(() => {
            this.setState({ date: new Date() })
        }, 500);
    }

    componentWillUnmount() {
        clearInterval(this._dateUpdateInterval);
    }

    render() {
        return (
            <div className = { styles.clock }>
                { this.state.date.toLocaleTimeString() }
            </div>
        );
    }
}
