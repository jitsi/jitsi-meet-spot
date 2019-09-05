import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getProductName } from 'common/app-state';
import { StatusOverlay } from 'common/ui';

/**
 * Renders a text overlay which hides Jitsi-Meet iFrame when it's asking for
 * feedback.
 *
 * @returns {ReactNode}
 */
export function FeedbackHider({ productName }) {
    return (
        <StatusOverlay title = { `Thanks for using ${productName}!` }>
            <div>You can use the remote control device to submit feedback now.</div>
        </StatusOverlay>
    );
}

FeedbackHider.propTypes = {
    productName: PropTypes.string
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

export default connect(mapStateToProps)(FeedbackHider);
