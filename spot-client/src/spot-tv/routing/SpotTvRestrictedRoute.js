import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';

import { getPermanentPairingCode, isBackendEnabled } from 'common/backend';
import { ROUTES } from 'common/routing';
import { isSupportedSpotTvBrowser } from 'common/detection';

/**
 * Creates a Route which only allows the view to be displayed if on a supported
 * browser, otherwise redirects to the unsupported browser route.
 *
 * @extends Rect.PureComponent
 */
export class SpotTvRestrictedRoute extends React.PureComponent {
    static defaultProps = {
        requireSetup: true
    };

    static propTypes = {
        isBackendSetupComplete: PropTypes.bool,
        requireSetup: PropTypes.bool
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (!isSupportedSpotTvBrowser()) {
            return <Redirect to = { ROUTES.UNSUPPORTED_BROWSER } />;
        }

        const {
            requireSetup,
            isBackendSetupComplete,
            ...routeProps
        } = this.props;

        if (requireSetup && !isBackendSetupComplete) {
            return <Redirect to = { ROUTES.SETUP } />;
        }

        return <Route { ...routeProps } />;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code SpotTvRestrictedRoute}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isBackendSetupComplete: isBackendEnabled(state)
            ? Boolean(getPermanentPairingCode(state))
            : true
    };
}


/**
 * Creates actions which can update Redux state. Purposefully returns an empty
 * object as a hack to  remove dispatch from props.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps() {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(SpotTvRestrictedRoute);
