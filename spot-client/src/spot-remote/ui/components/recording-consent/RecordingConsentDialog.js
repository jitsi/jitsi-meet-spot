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
export class RecordingConsentDialog extends React.Component {
    static propTypes = {
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
    };

    /**
     * Handler for when user consents to recording and wants to unmute.
     *
     * @private
     * @returns {void}
     */
    _onConsentWithUnmute = () => {
        remoteControlClient.grantRecordingConsent(true);
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

export default connect(null, null)(withTranslation()(RecordingConsentDialog));
