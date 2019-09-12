import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { sendTouchTones } from 'common/app-state';
import { logger } from 'common/logger';
import { Modal } from 'common/ui';

import { StatelessDialPad } from './../dial-pad';

/**
 * Displays a dial pad for requesting touch tones to be played.
 *
 * @extends React.Component
 */
export class DTMFModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        onSendTones: PropTypes.func
    };

    /**
     * Initializes a new {@code DTMFModal} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            value: ''
        };

        this._onChange = this._onChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Modal onClose = { this.props.onClose }>
                <div className = 'dtmf-modal'>
                    <StatelessDialPad
                        buttonText = 'Send'
                        onChange = { this._onChange }
                        onSubmit = { this._onSubmit }
                        placeholderText = 'Enter Numbers'
                        value = { this.state.value } />
                </div>
            </Modal>
        );
    }

    /**
     * Callback invoked to update the known entered number in the dial pad.
     *
     * @param {string} value - The new entered number.
     * @private
     * @returns {void}
     */
    _onChange(value) {
        this.setState({ value });
    }

    /**
     * Requests the entered number be played as tones.
     *
     * @param {*} _ - Meeting names details. Not used for the purpose of
     * sending tones.
     * @param {string} tones - The number to be played.
     * @private
     * @returns {void}
     */
    _onSubmit(_, tones) {
        logger.log('submitting touch tones');

        this.props.onSendTones(tones);
        this.setState({ value: '' });
    }
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Plays the passed in string as touch tones.
         *
         * @param {string} tones - The dial pad characters to play as touch
         * tones.
         * @returns {void}
         */
        onSendTones(tones) {
            dispatch(sendTouchTones(tones));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(DTMFModal);
