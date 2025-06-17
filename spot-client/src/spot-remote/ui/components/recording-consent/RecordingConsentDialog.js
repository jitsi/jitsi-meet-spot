import { hideModal } from 'common/app-state';
import { remoteControlClient } from 'common/remote-control';
import { Button, Modal } from 'common/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

/**
 * A modal dialog component that displays a recording consent notification to users
 * when a recording is in progress. The dialog provides two options: consent to
 * recording while remaining muted, or consent to recording and unmute the user.
 */
class RecordingConsentDialog extends React.Component {
    static propTypes = {
        hideModal: PropTypes.func,
        onConsent: PropTypes.func,
        onConsentWithUnmute: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Handler for when user consents to recording without unmuting.
     *
     * @private
     * @returns {void}
     */
    _onConsent = () => {
        remoteControlClient.grantRecordingConsent(false);

        this.props.hideModal();
    };

    /**
     * Handler for when user consents to recording and wants to unmute.
     *
     * @private
     * @returns {void}
     */
    _onConsentWithUnmute = () => {
        remoteControlClient.grantRecordingConsent(true);

        this.props.hideModal();
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
                qaId = 'recording-consent-modal'>
                <div className = 'recording-consent-modal'>
                    <div className = 'content'>
                        <div className = 'title'>
                            { t('recording.inProgressTitle') }
                        </div>
                        <div className = 'description'>
                            { t('recording.inProgressDescription') }
                        </div>
                    </div>
                    <div className = 'footer'>
                        <Button
                            appearance = 'primary'
                            className = 'understand-button-unmute'
                            onClick = { this._onConsentWithUnmute }
                            qaId = 'understand-unmute-button'>
                            { t('recording.understandAndUnmute') }
                        </Button>
                        <Button
                            appearance = 'primary'
                            className = 'understand-button'
                            onClick = { this._onConsent }
                            qaId = 'understand-button'>
                            { t('recording.understand') }
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
        /**
         * Closes the currently displayed modal.
         *
         * @returns {void}
         */
        hideModal() {
            dispatch(hideModal());
        }
    };
}

export default connect(null, mapDispatchToProps)(withTranslation()(RecordingConsentDialog));
