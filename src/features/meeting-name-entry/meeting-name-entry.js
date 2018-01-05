import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import styles from './meeting-name-entry.css';

export class MeetingNameEntry extends React.Component {
    static propTypes = {
        onSubmit: PropTypes.func
    };

    constructor(props) {
        super(props);

        this._onMeetingNameChange = this._onMeetingNameChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);

        this.state = {
            meetingName: ''
        };
    }

    render() {
        return (
            <form
                className = { styles.wrapper }
                onSubmit = { this._onSubmit } >
                <input
                    className = { styles.input }
                    onChange = { this._onMeetingNameChange }
                    placeholder = 'Enter a meeting name'
                    value = { this.state.meetingName } />
                <button
                    className = { styles.button }
                    type = 'submit'>GO</button>
            </form>
        );
    }

    _onMeetingNameChange(event) {
        this.setState({
            meetingName: event.target.value
        });
    }

    _onSubmit(event) {
        event.preventDefault();
        if (this.props.onSubmit && this.state.meetingName) {
            this.props.onSubmit(this.state.meetingName);
        }
    }
}

export default connect()(MeetingNameEntry);
