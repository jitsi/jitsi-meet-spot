import React from 'react';

import { isSupportedSpotTvBrowser } from 'common/utils';

import { ROUTES } from './constants';
import RestrictedRoute from './RestrictedRoute';

/**
 * Creates a Route which only allows the view to be displayed if on a supported
 * browser, otherwise redirects to the unsupported browser route.
 *
 * @extends Rect.Component
 */
export default class SpotTVRestrictedRoute extends React.Component {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <RestrictedRoute
                { ...this.props }
                canAccessRoute = { isSupportedSpotTvBrowser }
                redirectRoute = { ROUTES.UNSUPPORTED_BROWSER } />
        );
    }
}
