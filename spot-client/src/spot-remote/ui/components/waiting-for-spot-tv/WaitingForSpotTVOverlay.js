import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getProductName } from 'common/app-state';
import { StatusOverlay } from 'common/ui';

/**
 * Informs that the Spot-TV may not be online.
 *
 * @returns {ReactElement}
 */
export function WaitingForSpotTVOverlay({ productName }) {
    return (
        <StatusOverlay
            showBackground = { true }
            title = { `Waiting for ${productName} TV to connect` }>
            <div data-qa-id = 'waiting-for-spot-tv'>
                Please make sure the associated { productName } TV<br />
                is currently running and connected to the Internet.
            </div>
        </StatusOverlay>
    );
}

WaitingForSpotTVOverlay.propTypes = {
    productName: PropTypes.string
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code WaitingForSpotTVOverlay}.
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

export default connect(mapStateToProps)(WaitingForSpotTVOverlay);
