import { hideModal, hangUp } from 'common/app-state';
import { Button, Modal } from 'common/ui';

import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

/**
 * Implements a modal to adjust the volume of the spot tv remotely.
 */
export class HangupModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        t: PropTypes.func
    };

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
                            { t('hangup.confirmation') }
                        </div>
                    </div>
                    <div className = 'footer'>
                        <Button
                            appearance = 'primary'
                            className = 'hangup-button'
                            color='secondary'
                            onClick = { this.props.onHangup }
                            qaId = 'hangup-button'>
                               { t('hangup.button') }
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
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
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