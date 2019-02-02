import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'features/button';
import { Input } from 'features/input';
import styles from './meeting-name-entry.css';

/**
 * Displays an input for entering the name of a meeting.
 *
 * @extends React.Component
 */
export class MeetingNameEntry extends React.Component {
    static propTypes = {
        onSubmit: PropTypes.func
    };

    /**
     * Initializes a new {@code MeetingNameEntry} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onMeetingNameChange = this._onMeetingNameChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);

        this.state = {
            meetingName: ''
        };
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <form
                className = { styles.wrapper }
                onSubmit = { this._onSubmit } >
                <Input
                    data-qa-id = 'meeting-name-input'
                    id = 'meeting-name-input'
                    onChange = { this._onMeetingNameChange }
                    placeholder = 'Enter a meeting name'
                    value = { this.state.meetingName } />
                <Button
                    data-qa-id = 'meeting-name-submit'
                    type = 'submit'>
                    GO
                </Button>
            </form>
        );
    }

    /**
     * Updates the known meeting name that has been entered into the input.
     *
     * @param {Event} event - The change event from updating the entered meeting
     * name.
     * @private
     * @returns {void}
     */
    _onMeetingNameChange(event) {
        this.setState({
            meetingName: event.target.value
        });
    }

    /**
     * Callback invoked to signal the entered meeting should be joined.
     *
     * @param {Event} event - The form submission event to proceed to the
     * meeting.
     * @private
     * @returns {void}
     */
    _onSubmit(event) {
        event.preventDefault();

        const meetingName = this.state.meetingName.trim();

        if (meetingName) {
            this.props.onSubmit(meetingName);
        }
    }
}

export default MeetingNameEntry;
