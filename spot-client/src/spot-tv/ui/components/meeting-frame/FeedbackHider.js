import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { getProductName } from 'common/app-state';
import { StatusOverlay } from 'common/ui';

/**
 * Renders a text overlay which hides Jitsi-Meet iFrame when it's asking for
 * feedback.
 *
 * @returns {ReactNode}
 */
export function FeedbackHider({ productName, t }) {
    return (
        <StatusOverlay title = { t('feedback.thanks', { productName }) }>
            <div>{ t('feedback.howTo') }</div>
        </StatusOverlay>
    );
}

FeedbackHider.propTypes = {
    productName: PropTypes.string,
    t: PropTypes.func
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code FeedbackHider}.
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

export default connect(mapStateToProps)(
    withTranslation()(FeedbackHider)
);
