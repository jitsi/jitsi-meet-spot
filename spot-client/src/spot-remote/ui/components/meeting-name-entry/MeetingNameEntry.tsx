import { Button } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';


/**
 * The type of the props of {@link MeetingNameEntry}.
 */
interface IProps {
    domain?: string;
    meetingName?: string;
    onBlur?: (...args: any[]) => void;
    onChange?: (value: string) => void;
    onFocus?: (...args: any[]) => void;
    onSubmit?: (...args: any[]) => void;
    placeholder?: string;
    t?: (key: string) => string;
}

/**
 * Displays an input for entering the name of a meeting.
 */
export class MeetingNameEntry extends React.Component<IProps> {
    /**
     * Initializes a new {@code MeetingNameEntry} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
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
                        { t?.('adhoc.label') }
                    </label>
                    <div className = 'input-with-default-domain'>
                        <div className = 'input-url'>
                            <span className = 'default-domain'>
                                { domain }
                            </span>
                            <input
                                autoComplete = 'off'
                                className = 'input meeting-name-input'
                                data-qa-id = 'meeting-name-input'
                                onBlur = { onBlur }
                                onChange = { this._onMeetingNameChange }
                                onFocus = { onFocus }
                                placeholder = { placeholder || t?.('adhoc.enterName') }
                                spellCheck = { false }
                                value = { meetingName } />
                        </div>
                        <Button
                            className = 'meeting-name-submit'
                            qaId = 'meeting-name-submit'
                            type = 'submit'>
                            { t?.('buttons.go') }
                        </Button>
                    </div>
                </div>
            </form>
        );
    }

    /**
     * Updates the known meeting name that has been entered into the input.
     *
     * @param event - The change event from updating the entered meeting
     * name.
     * @private
     * @returns {void}
     */
    _onMeetingNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.props.onChange?.(event.target.value);
    }

    /**
     * Callback invoked to signal the entered meeting should be joined.
     *
     * @param event - The form submission event to proceed to the
     * meeting.
     * @private
     * @returns {void}
     */
    _onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        this.props.onSubmit?.();
    }
}

export default withTranslation()(MeetingNameEntry);
