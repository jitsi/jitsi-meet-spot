import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays a notification message with the approriate styling for the
 * notification type.
 *
 * @returns {ReactElement}
 */
export function Notification({ message, type }) {
    return (
        <div className = { `notification notification-${type}` }>
            { message }
        </div>
    );
}

Notification.propTypes = {
    message: PropTypes.string,
    type: PropTypes.string
};

export default Notification;
