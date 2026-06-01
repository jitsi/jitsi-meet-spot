import type { RootState } from 'common/app-state';
import { getProductName } from 'common/app-state';
import { StatusOverlay } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


interface IProps {

    /**
     * The name of the product, displayed in the overlay text.
     */
    productName?: string;

    /**
     * The translate function.
     */
    t?: (key: string, options?: Record<string, unknown>) => string;
}

/**
 * Renders a text overlay which hides Jitsi-Meet iFrame when it's asking for
 * feedback.
 *
 * @returns {ReactNode}
 */
export function FeedbackHider({ productName, t = (key: string) => key }: IProps) {
    return (
        <StatusOverlay title = { t('feedback.thanks', { productName }) }>
            <div>{ t('feedback.howTo') }</div>
        </StatusOverlay>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code FeedbackHider}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        productName: getProductName(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(FeedbackHider));
