import { logger } from 'common/logger';
import { Button, Input } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';

interface IProps {
    onCancel?: (...args: any[]) => void;
    onSubmit?: (password: string) => void;
    t?: (key: string) => string;
}

interface IState {
    enteredPassword: string;
}

/**
 * Requests entry of a password.
 */
export class PasswordPrompt extends React.Component<IProps, IState> {
    /**
     * Initializes a new {@code PasswordPrompt} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this.state = {
            enteredPassword: ''
        };

        this._onInputChange = this._onInputChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns
     */
    render() {
        const { onCancel, t } = this.props;
        const { enteredPassword } = this.state;

        return (
            <form
                className = 'password-prompt'
                onSubmit = { this._onSubmit }>
                <div className = 'cta'>
                    { t?.('conferenceStatus.enterPassword') }
                </div>
                <Input
                    onChange = { this._onInputChange }
                    placeholder = { t?.('conferenceStatus.password') }
                    value = { enteredPassword } />
                <div className = 'password-prompt-buttons'>
                    <Button
                        appearance = 'subtle'
                        className = 'skip-button'
                        onClick = { onCancel }>
                        { t?.('buttons.cancel') }
                    </Button>
                    <Button type = 'submit'>
                        { t?.('buttons.submit') }
                    </Button>
                </div>
            </form>
        );
    }

    /**
     * Callback invoked to update the known entered password.
     *
     * @param e - The synthetic event for the input change.
     * @private
     * @returns
     */
    _onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ enteredPassword: e.target.value });
    }

    /**
     * Callback invoked to send the entered password.
     *
     * @param e - The synthetic event for submitting the password form.
     * @private
     * @returns
     */
    _onSubmit(e: React.FormEvent) {
        e.preventDefault();

        logger.log('submitting password for meeting');

        this.props.onSubmit?.(this.state.enteredPassword);
    }
}

export default withTranslation()(PasswordPrompt);
