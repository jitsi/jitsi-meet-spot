import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { getProductName } from 'common/app-state';

/**
 * Displays a message stating the current browser cannot be used for Spot-TV.
 *
 * @returns {ReactElement}
 */
export function UnsupportedBrowser({ productName, t }) {
    return (
        <div className = 'unsupported-browser'>
            <div>{ t('appStatus.tvNotSupported', { productName })}</div>
            <div>{ t('appStatus.useChrome', { productName }) }</div>
        </div>
    );
}

UnsupportedBrowser.propTypes = {
    productName: PropTypes.string,
    t: PropTypes.func
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

export default connect(mapStateToProps)(withTranslation()(UnsupportedBrowser));
