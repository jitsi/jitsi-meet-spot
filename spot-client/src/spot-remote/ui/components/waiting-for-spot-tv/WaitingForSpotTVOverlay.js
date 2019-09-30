import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { getProductName } from 'common/app-state';
import { StatusOverlay } from 'common/ui';

/**
 * Informs that the Spot-TV may not be online.
 *
 * @returns {ReactElement}
 */
export function WaitingForSpotTVOverlay({ productName, t }) {
    return (
        <StatusOverlay
            showBackground = { true }
            title = { t('appStatus.waitingForTv', { productName }) }>
            <div data-qa-id = 'waiting-for-spot-tv'>
                { t('appStatus.checkTvConnection', { productName }) }
            </div>
        </StatusOverlay>
    );
}

WaitingForSpotTVOverlay.propTypes = {
    productName: PropTypes.string,
    t: PropTypes.func
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

export default connect(mapStateToProps)(withTranslation()(WaitingForSpotTVOverlay));
