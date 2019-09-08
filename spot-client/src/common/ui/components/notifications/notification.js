import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

/**
 * Displays a notification message with the approriate styling for the
 * notification type.
 *
 * @returns {ReactElement}
 */
export function Notification({ message, messageKey, t, type }) {
    return (
        <div className = { `notification notification-${type}` }>
            { message || t(messageKey) }
        </div>
    );
}

Notification.propTypes = {
    message: PropTypes.string,
    messageKey: PropTypes.string,
    t: PropTypes.func,
    type: PropTypes.string
};

export default withTranslation()(Notification);
