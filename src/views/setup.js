import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Setup as SetupSteps } from 'features/setup';
import { ROUTES } from 'routing';

import View from './view';
import styles from './view.css';

/**
 * Displays the Spot setup flow.
 *
 * @extends React.Component
 */
export class Setup extends React.Component {
    static propTypes = {
        history: PropTypes.object
    };

    /**
     * Initializes a new {@code Setup} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._redirectToCalendar = this._redirectToCalendar.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <View name = 'setup'>
                <div className = { styles.container }>
                    <SetupSteps onSuccess = { this._redirectToCalendar } />
                </div>
            </View>
        );
    }

    /**
     * Attempts to redirect back to home view after setup has been completed.
     *
     * @private
     * @returns {void}
     */
    _redirectToCalendar() {
        this.props.history.push(ROUTES.CALENDAR);
    }
}

export default connect()(Setup);
