import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { Dialpad } from 'common/icons';

import { NavButton } from '../nav';

/**
 * A component for accessing the DTMF dial pad.
 *
 * @param {Object} props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export function DTMFButton({ onClick, t }) {
    return (
        <NavButton
            label = { t('commands.dialTones') }
            onClick = { onClick }>
            <Dialpad />
        </NavButton>
    );
}

DTMFButton.propTypes = {
    onClick: PropTypes.func,
    t: PropTypes.func
};

export default withTranslation()(DTMFButton);
