import PropTypes from 'prop-types';
import React from 'react';

import { analytics, meetingJoinEvents } from 'common/analytics';
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

        this._onDeleteLastCharacter = this._onDeleteLastCharacter.bind(this);
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
                    <div className = 'row'>
                        { this._renderDialButton('1', '') }
                        { this._renderDialButton('2', 'ABC') }
                        { this._renderDialButton('3', 'DEF') }
                    </div>
                    <div className = 'row'>
                        { this._renderDialButton('4', 'GHI') }
                        { this._renderDialButton('5', 'JKL') }
                        { this._renderDialButton('6', 'MNO') }
                    </div>
                    <div className = 'row'>
                        { this._renderDialButton('7', 'PQRS') }
                        { this._renderDialButton('8', 'TUV') }
                        { this._renderDialButton('9', 'WXYZ') }
                    </div>
                    <div className = 'row'>
                        { this._renderDialButton('*') }
                        { this._renderDialButton('0') }
                        { this._renderDialButton('#') }
                    </div>
                </div>
                <div className = 'dial-pad-footer'>
                    <div className = 'dial-pad-footer-button' />
                    <div className = 'dial-pad-footer-button'>
                        <button
                            className = 'call-button'
                            onClick = { this._onGoToCall }
                            type = 'submit'>
                            Call
                        </button>
                    </div>
                    <div className = 'dial-pad-footer-button'>
                        <button
                            className = 'backspace'
                            onClick = { this._onDeleteLastCharacter }
                            type = 'button'>
                            <i className = 'material-icons'>backspace</i>
                        </button>
                    </div>
                </div>
            </form>
        );
    }

    /**
     * Removes the last character from the entered number.
     *
     * @private
     * @returns {void}
     */
    _onDeleteLastCharacter() {
        this.setState({
            enteredNumber: this.state.enteredNumber.slice(0, -1)
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

        analytics.log(meetingJoinEvents.DIAL_OUT);

        this.props.onSubmit(
            getRandomMeetingName(),
            {
                invites: [
                    {
                        type: 'phone', // jitsi-meet expects type phone
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
     * Helper to create a button for display in the dial pad.
     *
     * @param {string} main - The value of the button.
     * @param {string} sub - A smaller value to display at the bottom of the
     * button.
     * @private
     * @returns {ReactComponent}
     */
    _renderDialButton(main, sub) {
        return (
            <DialButton
                key = { main }
                main = { main }
                onClick = { this._onDialButtonClick }
                sub = { sub } />
        );
    }
}
