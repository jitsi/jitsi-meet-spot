import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { ROUTES } from 'common/routing';

import { Setup as SetupSteps } from './../components';
import { withCalendar } from './../loaders';

/**
 * Displays the Spot setup flow.
 *
 * @extends React.Component
 */
export class Setup extends React.Component {
    static propTypes = {
        history: PropTypes.object,
        remoteControlService: PropTypes.object
    };

    /**
     * Initializes a new {@code Setup} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onRedirectHome = this._onRedirectHome.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = 'container'>
                <SetupSteps onSuccess = { this._onRedirectHome } />
            </div>
        );
    }

    /**
     * Attempts to redirect back to home view after setup has been completed.
     *
     * @private
     * @returns {void}
     */
    _onRedirectHome() {
        this.props.history.push(ROUTES.HOME);
    }
}

export default withRouter(withCalendar(connect()(Setup)));
