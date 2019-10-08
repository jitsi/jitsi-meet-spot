import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

/**
 * Displays a notification message with the approriate styling for the
 * notification type.
 *
 * @returns {ReactElement}
 */
export function Notification({ messageKey, messageParams, t, type }) {
    return (
        <div className = { `notification notification-${type}` }>
            { t(messageKey, messageParams) }
        </div>
    );
}

Notification.propTypes = {
    messageKey: PropTypes.string,
    messageParams: PropTypes.object,
    t: PropTypes.func,
    type: PropTypes.string
};

export default withTranslation()(Notification);
