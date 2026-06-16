import type { RootState } from 'common/app-state';
import { getPermanentPairingCode, isBackendEnabled } from 'common/backend';
import { isSupportedSpotTvBrowser } from 'common/detection';
import { ROUTES } from 'common/routing';
import React from 'react';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';


interface IProps {
    children?: React.ReactNode;
    isBackendSetupComplete?: boolean;
    requireSetup?: boolean;
}

/**
 * Wraps a route's element so it is only displayed on a supported browser and,
 * optionally, once setup is complete; otherwise it redirects to the unsupported
 * browser or setup route. (In React Router v6+ {@code <Routes>} only accepts
 * {@code <Route>} children, so this is now an element guard rather than a route
 * itself.)
 */
export class SpotTvRestrictedRoute extends React.PureComponent<IProps> {
    static defaultProps = {
        requireSetup: true
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (!isSupportedSpotTvBrowser()) {
            return <Navigate
                replace = { true }
                to = { ROUTES.UNSUPPORTED_BROWSER } />;
        }

        const { requireSetup, isBackendSetupComplete } = this.props;

        if (requireSetup && !isBackendSetupComplete) {
            return <Navigate
                replace = { true }
                to = { ROUTES.SETUP } />;
        }

        return <>{ this.props.children }</>;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code SpotTvRestrictedRoute}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
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
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps() {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(SpotTvRestrictedRoute);
