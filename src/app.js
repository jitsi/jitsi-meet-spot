import PropTypes from 'prop-types';
import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import { Notifications } from 'features/notifications';
import { ErrorBoundary } from 'features/error-boundary';
import { ROUTES } from 'routing';
import {
    Admin,
    FatalError,
    Home,
    Loading,
    Meeting,
    RemoteControl,
    Setup
} from 'views';

/**
 * The root of the application which determines what view should be displayed.
 *
 * @extends React.Component
 */
export class App extends React.Component {
    static propTypes = {
        location: PropTypes.object
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        // Outlook auth redirect URL cannot be a direct hash route. The
        // workaround implemented is redirecting to the home route but detecting
        // when it might be a oauth redirect.
        if (window.opener
            && this.props.location.pathname.includes('access_token')) {
            window.opener.postMessage({
                type: 'ms-login',
                url: window.location.href
            }, window.location.origin);

            return (
                <div>
                    Auth successful!
                </div>
            );
        }

        return (
            <div>
                <Notifications />
                <ErrorBoundary errorComponent = { FatalError }>
                    <Switch>
                        <Route
                            path = { ROUTES.ADMIN }
                            component = { Admin } />
                        <Route
                            path = { ROUTES.MEETING }
                            component = { Meeting } />
                        <Route
                            path = { ROUTES.SETUP }
                            component = { Setup } />
                        <Route
                            path = { ROUTES.LOADING }
                            component = { Loading } />
                        <Route
                            path = { ROUTES.REMOTE_CONTROL }
                            component = { RemoteControl } />
                        <Route
                            component = { Home } />
                    </Switch>
                </ErrorBoundary>
            </div>
        );
    }
}

export default withRouter(App);
