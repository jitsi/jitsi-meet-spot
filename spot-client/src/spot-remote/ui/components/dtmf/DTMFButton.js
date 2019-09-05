import PropTypes from 'prop-types';
import React from 'react';

import { Dialpad } from 'common/icons';

import { NavButton } from '../nav';

/**
 * A component for accessing the DTMF dial pad.
 *
 * @extends React.Component
 */
export default class DTMFButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <NavButton
                label = 'Dial Tones'
                onClick = { this.props.onClick }>
                <Dialpad />
            </NavButton>
        );
    }
}
