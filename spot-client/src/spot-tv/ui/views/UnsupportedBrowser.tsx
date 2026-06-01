import type { RootState } from 'common/app-state';
import { getProductName } from 'common/app-state';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

interface IProps {

    /**
     * The name of the product to display in the message.
     */
    productName?: string;

    /**
     * The i18next translation function.
     */
    t?: (key: string, options?: any) => string;
}

/**
 * Displays a message stating the current browser cannot be used for Spot-TV.
 *
 * @returns {ReactElement}
 */
export function UnsupportedBrowser({ productName, t }: IProps) {
    return (
        <div className = 'unsupported-browser'>
            <div>{ t?.('appStatus.tvNotSupported', { productName })}</div>
            <div>{ t?.('appStatus.useChrome', { productName }) }</div>
        </div>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code UnsupportedBrowser}.
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

export default connect(mapStateToProps)(withTranslation()(UnsupportedBrowser));
