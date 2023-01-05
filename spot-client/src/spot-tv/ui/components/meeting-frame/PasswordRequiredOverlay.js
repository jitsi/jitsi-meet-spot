import { StatusOverlay } from 'common/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';


/**
 * Renders a text overlay which hides Jitsi-Meet iFrame when joining a meeting
 * requires a password be entered.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function PasswordRequiredOverlay({ t }) {
    return (
        <StatusOverlay title = { t('conferenceStatus.passwordRequired') }>
            <div>{ t('conferenceStatus.howToEnterPassword') }</div>
        </StatusOverlay>
    );
}

PasswordRequiredOverlay.propTypes = {
    t: PropTypes.func
};

export default withTranslation()(PasswordRequiredOverlay);
