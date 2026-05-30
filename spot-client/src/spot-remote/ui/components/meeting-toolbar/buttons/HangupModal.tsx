import { hangUp, hideModal } from 'common/app-state';
import { Button, Modal } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

/**
 * The type of the props of {@link HangupModal}.
 */
interface IProps {

    /**
     * Callback to invoke when the modal should be closed.
     */
    onClose?: (...args: any[]) => void;

    /**
     * Callback to invoke when the user confirms they want to hang up.
     */
    onHangup?: (...args: any[]) => void;

    /**
     * The translation function.
     */
    t?: (key: string) => string;
}

/**
 * Implements a modal dialog for confirming that the user wants to hang up.
 */
export class HangupModal extends React.Component<IProps> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { t } = this.props;

        return (
            <Modal
                onClose = { this.props.onClose }
                qaId = 'hangup-modal'>
                <div className = 'hangup-modal-select'>
                    <div className = 'content'>
                        <div className = 'description'>
                            { t?.('hangup.confirmation') }
                        </div>
                    </div>
                    <div className = 'footer'>
                        <Button
                            appearance = 'primary'
                            className = 'hangup-button'
                            onClick = { this.props.onHangup }
                            qaId = 'hangup-button'>
                            { t?.('hangup.button') }
                        </Button>
                    </div>
                </div>
            </Modal>
        );
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
        onClose() {
            dispatch(hideModal());
        },
        onHangup() {
            dispatch(hangUp());
            dispatch(hideModal());
        }
    };
}

export default connect(null, mapDispatchToProps)(withTranslation()(HangupModal));
