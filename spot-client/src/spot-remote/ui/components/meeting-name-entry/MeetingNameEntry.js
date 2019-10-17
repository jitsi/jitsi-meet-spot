import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { Button } from 'common/ui';

/**
 * Displays an input for entering the name of a meeting.
 *
 * @extends React.Component
 */
export class MeetingNameEntry extends React.Component {
    static propTypes = {
        domain: PropTypes.string,
        meetingName: PropTypes.string,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        onSubmit: PropTypes.func,
        placeholder: PropTypes.string,
        t: PropTypes.func
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
        const {
            domain,
            meetingName,
            onBlur,
            onFocus,
            placeholder,
            t
        } = this.props;

        return (
            <form
                className = 'meeting-name-entry'
                onSubmit = { this._onSubmit } >
                <div className = 'input-container'>
                    <label className = 'input-label'>
                        { t('adhoc.label') }
                    </label>
                    <div className = 'input-with-default-domain'>
                        <div className = 'input-url'>
                            <span className = 'default-domain'>
                                { `${domain}/` }
                            </span>
                            <input
                                autoComplete = 'off'
                                className = 'input'
                                data-qa-id = 'meeting-name-input'
                                onBlur = { onBlur }
                                onChange = { this._onMeetingNameChange }
                                onFocus = { onFocus }
                                placeholder = { placeholder || t('adhoc.enterName') }
                                spellCheck = { false }
                                value = { meetingName } />
                        </div>
                        <Button
                            qaId = 'meeting-name-submit'
                            type = 'submit'>
                            { t('buttons.go') }
                        </Button>
                    </div>
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

export default withTranslation()(MeetingNameEntry);
