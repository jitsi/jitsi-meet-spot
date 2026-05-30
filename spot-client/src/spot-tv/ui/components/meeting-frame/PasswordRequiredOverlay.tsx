import { StatusOverlay } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';


/**
 * The type of the React {@code Component} props of {@link PasswordRequiredOverlay}.
 */
interface IProps {

    /**
     * The translate function.
     */
    t?: (key: string) => string;
}

/**
 * Renders a text overlay which hides Jitsi-Meet iFrame when joining a meeting
 * requires a password be entered.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function PasswordRequiredOverlay({ t }: IProps) {
    return (
        <StatusOverlay title = { t?.('conferenceStatus.passwordRequired') }>
            <div>{ t?.('conferenceStatus.howToEnterPassword') }</div>
        </StatusOverlay>
    );
}

export default withTranslation()(PasswordRequiredOverlay);
