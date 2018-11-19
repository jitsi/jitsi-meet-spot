import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Setup as SetupSteps } from 'features/setup';

import View from './view';
import styles from './view.css';

/**
 * Displays the application setup flow.
 *
 * @extends React.Component
 */
export class Setup extends React.Component {
    static propTypes = {
        backgroundImageUrl: PropTypes.string,
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
            <View
                backgroundImageUrl = { this.props.backgroundImageUrl }
                name = 'setup'>
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
        this.props.history.push('/');
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Setup}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        backgroundImageUrl: state.config.DEFAULT_BACKGROUND_IMAGE_URL
    };
}

export default connect(mapStateToProps)(Setup);
