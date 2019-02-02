import PropTypes from 'prop-types';
import React from 'react';

import styles from './notifications.css';

/**
 * Displays a notification message with the approriate styling for the
 * notification type.
 *
 * @returns {ReactElement}
 */
export function Notification({ message, type }) {
    const typeStyles = styles[type] || styles.default;

    return (
        <div className = { `${styles.notification} ${typeStyles}` }>
            { message }
        </div>
    );
}

Notification.propTypes = {
    message: PropTypes.string,
    type: PropTypes.string
};

export default Notification;
