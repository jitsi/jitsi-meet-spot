import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import { Nav } from 'features/debug';
import { ROUTES, PrivateRoute } from 'routing';
import {
    Admin,
    Calendar,
    Loading,
    Meeting,
    RemoteControl,
    Setup
} from 'views';

// eslint-disable-next-line no-undef
const showDebugNav = process.env.NODE_ENV !== 'production';

/**
 * The root of the application which determines what view should be displayed.
 *
 * @extends React.Component
 */
export class App extends React.Component {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div>
                <Switch>
                    <PrivateRoute
                        path = { ROUTES.ADMIN }
                        component = { Admin } />
                    <PrivateRoute
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
                    <PrivateRoute
                        component = { Calendar} />
                </Switch>
                { showDebugNav ? <Nav /> : null }
            </div>
        );
    }
}

export default withRouter(App);
