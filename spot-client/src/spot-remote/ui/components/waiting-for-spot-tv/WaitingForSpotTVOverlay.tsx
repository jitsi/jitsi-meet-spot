import { getProductName } from 'common/app-state';
import { StatusOverlay } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


interface IProps {
    productName?: string;
    t?: (key: string, options?: Record<string, unknown>) => string;
}

/**
 * Informs that the Spot-TV may not be online.
 *
 * @returns {ReactElement}
 */
export function WaitingForSpotTVOverlay({ productName, t }: IProps) {
    return (
        <StatusOverlay
            showBackground = { true }
            title = { t?.('appStatus.waitingForTv', { productName }) }>
            <div
                data-qa-id = 'waiting-for-spot-tv'
                id = 'waiting-for-spot-tv'>
                { t?.('appStatus.checkTvConnection', { productName }) }
            </div>
        </StatusOverlay>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code WaitingForSpotTVOverlay}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
    return {
        productName: getProductName(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(WaitingForSpotTVOverlay));
