import PropTypes from 'prop-types';
import React from 'react';

import { Input } from 'common/ui';

/**
 * Displays an input for entering the name of a meeting.
 *
 * @extends React.Component
 */
export class MeetingNameEntry extends React.Component {
    static propTypes = {
        meetingName: PropTypes.string,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        onNameChange: PropTypes.func,
        onSubmit: PropTypes.func,
        placeholder: PropTypes.string
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
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <form
                className = 'meeting-name-entry'
                onSubmit = { this._onSubmit } >
                <div className = 'input-container'>
                    <label className = 'input-label'>
                        Start a new meeting
                    </label>
                    <Input
                        autoComplete = 'off'
                        className = 'input'
                        data-qa-id = 'meeting-name-input'
                        onBlur = { this.props.onBlur }
                        onChange = { this._onMeetingNameChange }
                        onFocus = { this.props.onFocus }
                        placeholder = { this.props.placeholder
                            || 'Enter a meeting name' }
                        spellCheck = { false }
                        value = { this.props.meetingName } />
                </div>
                <div className = 'submit-wrapper'>
                    <button
                        className = 'submit-button'
                        data-qa-id = 'meeting-name-submit'
                        type = 'submit'>
                        GO
                    </button>
                </div>
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
        this.props.onChange(event.target.value);
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

        this.props.onSubmit();
    }
}

export default MeetingNameEntry;
