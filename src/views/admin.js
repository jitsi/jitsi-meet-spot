import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { CalendarStatus, ResetState } from 'features/admin';

import View from './view';
import styles from './view.css';

/**
 * A component for providing post-setup application configuration.
 *
 * @returns {ReactElement}
 */
export function AdminView({ backgroundImageUrl }) {
    return (
        <View
            backgroundImageUrl = { backgroundImageUrl }
            name = 'admin'>
            <div className = { styles.container }>
                <div className = { styles.admin }>
                    <CalendarStatus />
                    <ResetState />
                </div>
            </div>
        </View>
    );
}

AdminView.propTypes = {
    backgroundImageUrl: PropTypes.string
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code AdminView}.
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


export default connect(mapStateToProps)(AdminView);
