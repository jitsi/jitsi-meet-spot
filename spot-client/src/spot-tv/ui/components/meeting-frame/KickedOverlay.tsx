import { Countdown, StatusOverlay } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';


interface IProps {

    /**
     * Callback invoked when the redirect countdown completes.
     */
    onRedirect?: (...args: any[]) => void;

    /**
     * The i18next translation function.
     */
    t?: (key: string) => string;
}

/**
 * Renders a text overlay which hides Jitsi-Meet iFrame when the local
 * participant has been removed from the meeting.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactNode}
 */
export function KickedOverlay({ onRedirect, t }: IProps) {
    return (
        <StatusOverlay title = { t?.('conferenceStatus.kicked') }>
            <div>{ t?.('conferenceStatus.exitingConference') }</div>
            <Countdown onCountdownComplete = { onRedirect } />
        </StatusOverlay>
    );
}

export default withTranslation()(KickedOverlay);
