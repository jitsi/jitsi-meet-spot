import PropTypes from 'prop-types';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

/**
 * Creates a Route which redirects to a provided route if a provide check does
 * not pass.
 *
 * @extends Rect.Component
 */
export default class BrowserRestrictedRoute extends React.Component {
    static propTypes = {
        canAccessRoute: PropTypes.func,
        redirectRoute: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            canAccessRoute,
            redirectRoute,
            ...routeProps
        } = this.props;

        return canAccessRoute()
            ? <Route { ...routeProps } />
            : <Redirect to = { redirectRoute } />;
    }
}
