import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

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
            <div>
                <form onSubmit = { this._onSubmit } >
                    <input
                        onChange = { this._onMeetingNameChange }
                        placeholder = 'GO!'
                        value = { this.state.meetingName } />
                    <button type = 'submit'>Go!</button>
                </form>
            </div>
        );
    }

    _onMeetingNameChange(event) {
        this.setState({
            meetingName: event.target.value
        });
    }

    _onSubmit(event) {
        event.preventDefault();
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.meetingName);
        }
    }
}

export default connect()(MeetingNameEntry);
