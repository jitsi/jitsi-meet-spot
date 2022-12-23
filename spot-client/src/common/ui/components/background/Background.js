import { getBackgroundUrl } from 'common/app-state';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Functional component for showing the configured background image URL with
 *  a gradient.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 * */
export function Background({ backgroundUrl }) {
    let backgroundStyles;

    if (backgroundUrl) {
        backgroundStyles = {
            background: `url('${backgroundUrl}')`
        };
    }

    return (
        <div
            className = 'view-background-container'
            style = { backgroundStyles }>
            <div className = 'view-gradient' />
        </div>
    );
}

Background.propTypes = {
    backgroundUrl: PropTypes.string
};

/**
 * Selects parts of the Redux state to pass in with the props of {@code View}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        backgroundUrl: getBackgroundUrl(state)
    };
}

export default connect(mapStateToProps)(Background);
