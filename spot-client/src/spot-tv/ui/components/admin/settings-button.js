import { Settings } from '@material-ui/icons';
import React from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from 'common/routing';

/**
 * A cog that directs to the settings view on click.
 */
class SettingsButton extends React.Component {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = 'cog'>
                <Link to = { ROUTES.ADMIN } >
                    <div data-qa-id = 'admin-settings'>
                        <Settings />
                    </div>
                </Link>
            </div>
        );
    }
}

export default SettingsButton;
