import PropTypes from 'prop-types';
import React from 'react';

import { getRandomMeetingName } from 'common/utils';

import DialButton from './dial-button';

/**
 * Displays numbers and an input for entering a phone number.
 *
 * @extends React.Component
 */
export default class DialPad extends React.Component {
    static propTypes = {
        onSubmit: PropTypes.func
    };

    /**
     * Initializes a new {@code DialPad} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            enteredNumber: ''
        };

        this._displayConfig = [
            {
                main: '1',
                sub: ''
            },
            {
                main: '2',
                sub: 'ABC'
            },
            {
                main: '3',
                sub: 'DEF'
            },
            {
                main: '4',
                sub: 'GHI'
            },
            {
                main: '5',
                sub: 'JKL'
            },
            {
                main: '6',
                sub: 'MNO'
            },
            {
                main: '7',
                sub: 'PQRS'
            },
            {
                main: '8',
                sub: 'TUV'
            },
            {
                main: '9',
                sub: 'WXYZ'
            },
            {
                main: '*'
            },
            {
                main: '0'
            },
            {
                main: '#'
            }
        ];

        this._onDialButtonClick = this._onDialButtonClick.bind(this);
        this._onGoToCall = this._onGoToCall.bind(this);
        this._onInputChange = this._onInputChange.bind(this);
        this._renderDialButton = this._renderDialButton.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <form
                className = 'dial-pad'
                onSubmit = { this._onGoToCall }>
                <div className = 'input-container'>
                    <input
                        autoComplete = { 'off' }
                        className = 'number-input'
                        onChange = { this._onInputChange }
                        spellCheck = { false }
                        type = 'tel'
                        value = { this.state.enteredNumber } />
                </div>
                <div className = 'dial-pad-buttons'>
                    { this._displayConfig.map(this._renderDialButton) }
                </div>
                <div>
                    <button
                        className = 'call-button'
                        onClick = { this._onGoToCall }
                        type = 'submit'>
                        Call
                    </button>
                </div>
            </form>
        );
    }

    /**
     * Callback invoked to enter a jitsi meeting and invite the entered
     * phone number.
     *
     * @param {Event} event - The form submission event to proceed to the a
     * call and invite the entered phone number.
     * @private
     * @returns {void}
     */
    _onGoToCall(event) {
        event.preventDefault();

        this.props.onSubmit(
            getRandomMeetingName(),
            {
                invites: [
                    {
                        type: 'phone', // jitsi-meet expets type phone
                        number: this.state.enteredNumber
                    }
                ]
            }
        );
    }

    /**
     * Callback invoked when the value of the entered number has been changed
     * through keyboard input.
     *
     * @param {ChangeEvent} event - The DOM event from the input field being
     * updated.
     * @private
     * @returns {void}
     */
    _onInputChange(event) {
        this.setState({
            enteredNumber: event.target.value
        });
    }

    /**
     * Callback invoked when a button on the dial pad is clicked.
     *
     * @param {string} value - The value of the button.
     * @private
     * @returns {void}
     */
    _onDialButtonClick(value) {
        this.setState({
            enteredNumber: this.state.enteredNumber + value
        });
    }

    /**
     * Helper to create a button for display in the dial pad.
     *
     * @param {Object} configuration - Describes how the button should display.
     * @param {string} configuration.main - The value of the button.
     * @param {string} configuration.sub - A smaller value to display at the
     * bottom of the button.
     * @private
     * @returns {ReactComponent}
     */
    _renderDialButton({ main, sub }) {
        return (
            <DialButton
                key = { main }
                main = { main }
                onClick = { this._onDialButtonClick }
                sub = { sub } />
        );
    }
}
