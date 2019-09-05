import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getProductName } from 'common/app-state';

/**
 * Displays a message stating the current browser cannot be used for Spot-TV.
 *
 * @returns {ReactElement}
 */
export function UnsupportedBrowser({ productName }) {
    return (
        <div className = 'unsupported-browser'>
            <div>
                Hosting { productName } is not supported on the current browser.
            </div>
            <div>Please open { productName } on Chrome desktop.</div>
        </div>
    );
}

UnsupportedBrowser.propTypes = {
    productName: PropTypes.string
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code UnsupportedBrowser}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        productName: getProductName(state)
    };
}


export default connect(mapStateToProps)(UnsupportedBrowser);
