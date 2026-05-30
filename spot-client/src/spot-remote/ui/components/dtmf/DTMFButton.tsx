import { Dialpad } from 'common/icons';
import React from 'react';
import { withTranslation } from 'react-i18next';


import { NavButton } from '../nav';

interface IProps {
    onClick?: (...args: any[]) => void;
    t?: (key: string) => string;
}

/**
 * A component for accessing the DTMF dial pad.
 *
 * @param props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export function DTMFButton({ onClick, t }: IProps) {
    return (
        <NavButton
            label = { t?.('commands.dialTones') }
            onClick = { onClick }>
            <Dialpad />
        </NavButton>
    );
}

export default withTranslation()(DTMFButton);
