import { PersonAdd } from 'common/icons';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';


import { NavButton } from '../nav';

/**
 * A component for accessing the DTMF dial pad.
 */
export class InviteButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func,
        t: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <NavButton
                label = { this.props.t('commands.invite') }
                onClick = { this.props.onClick }>
                <PersonAdd />
            </NavButton>
        );
    }
}

export default withTranslation()(InviteButton);
