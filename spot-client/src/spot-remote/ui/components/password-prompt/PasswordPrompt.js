import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { logger } from 'common/logger';
import { Button, Input } from 'common/ui';

/**
 * Requests entry of a password.
 *
 * @extends React.Component
 */
export class PasswordPrompt extends React.Component {
    static propTypes = {
        onCancel: PropTypes.func,
        onSubmit: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Initializes a new {@code PasswordPrompt} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
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
     * @returns {ReactElement}
     */
    render() {
        const { onCancel, t } = this.props;
        const { enteredPassword } = this.state;

        return (
            <form
                className = 'password-prompt'
                onSubmit = { this._onSubmit }>
                <div className = 'cta'>
                    { t('conferenceStatus.enterPassword') }
                </div>
                <Input
                    onChange = { this._onInputChange }
                    placeholder = { t('conferenceStatus.password') }
                    value = { enteredPassword } />
                <div className = 'password-prompt-buttons'>
                    <Button
                        appearance = 'subtle'
                        className = 'skip-button'
                        onClick = { onCancel }>
                        { t('buttons.cancel') }
                    </Button>
                    <Button type = 'submit'>
                        { t('buttons.submit') }
                    </Button>
                </div>
            </form>
        );
    }

    /**
     * Callback invoked to update the known entered password.
     *
     * @param {Object} e - The synthetic event for the input change.
     * @private
     * @returns {void}
     */
    _onInputChange(e) {
        this.setState({ enteredPassword: e.target.value });
    }

    /**
     * Callback invoked to send the entered password.
     *
     * @param {Object} e - The synthetic event for submitting the password form.
     * @private
     * @returns {void}
     */
    _onSubmit(e) {
        e.preventDefault();

        logger.log('submitting password for meeting');

        this.props.onSubmit(this.state.enteredPassword);
    }
}

export default withTranslation()(PasswordPrompt);
