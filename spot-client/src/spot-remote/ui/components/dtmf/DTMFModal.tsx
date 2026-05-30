import { sendTouchTones } from 'common/app-state';
import { logger } from 'common/logger';
import { Modal } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { StatelessDialPad } from './../dial-pad';

interface IProps {

    /**
     * Callback invoked to close the modal.
     */
    onClose?: () => void;

    /**
     * Callback invoked to play the entered touch tones.
     */
    onSendTones?: (tones: string) => void;

    /**
     * The translation function.
     */
    t?: (key: string) => string;
}

interface IState {

    /**
     * The currently entered dial pad value.
     */
    value: string;
}

/**
 * Displays a dial pad for requesting touch tones to be played.
 */
export class DTMFModal extends React.Component<IProps, IState> {
    /**
     * Initializes a new {@code DTMFModal} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this.state = {
            value: ''
        };

        this._onChange = this._onChange.bind(this);
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
                        disablePlusSign = { true }
                        onChange = { this._onChange }
                        placeholderText = { this.props.t?.('dial.enterNumbers') }
                        readOnlyInput = { true }
                        value = { this.state.value } />
                </div>
            </Modal>
        );
    }

    /**
     * Callback invoked to update the known entered number in the dial pad.
     *
     * @param value - The new entered number.
     * @private
     * @returns {void}
     */
    _onChange(value: string) {
        const enteredNumber = value[value.length - 1];

        logger.log('submitting touch tones', { value: enteredNumber });

        this.setState({
            value
        });

        this.props.onSendTones?.(enteredNumber);

    }
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        /**
         * Plays the passed in string as touch tones.
         *
         * @param tones - The dial pad characters to play as touch
         * tones.
         * @returns {void}
         */
        onSendTones(tones: string) {
            dispatch(sendTouchTones(tones));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(withTranslation()(DTMFModal));
