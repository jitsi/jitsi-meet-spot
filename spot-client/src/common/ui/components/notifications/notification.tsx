import React from 'react';
import { withTranslation } from 'react-i18next';

interface INotificationProps {
    messageKey?: string;
    messageParams?: any;
    t?: (key?: string, params?: any) => string;
    type?: string;
}

/**
 * Displays a notification message with the approriate styling for the
 * notification type.
 *
 * @returns {ReactElement}
 */
export function Notification({ messageKey, messageParams, t, type }: INotificationProps) {
    return (
        <div className = { `notification notification-${type}` }>
            { t?.(messageKey, messageParams) }
        </div>
    );
}

export default withTranslation()(Notification);
