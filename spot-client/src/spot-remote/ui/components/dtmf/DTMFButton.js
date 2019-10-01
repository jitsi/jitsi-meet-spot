import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { Dialpad } from 'common/icons';

import { NavButton } from '../nav';

/**
 * A component for accessing the DTMF dial pad.
 *
 * @extends React.Component
 */
export class DTMFButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func,
        t: PropTypes.funcs
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <NavButton
                label = { this.props.t('commands.dialTones') }
                onClick = { this.props.onClick }>
                <Dialpad />
            </NavButton>
        );
    }
}

export default withTranslation()(DTMFButton);
