import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import { FocusBorder } from 'features/accessibility';
import { Nav } from 'features/debug';
import { ErrorBoundary } from 'features/error-boundary';
import { ROUTES } from 'routing';
import {
    Admin,
    Calendar,
    FatalError,
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
                            component = { Calendar} />
                    </Switch>
                </ErrorBoundary>
                { showDebugNav ? <Nav /> : null }
                <FocusBorder />
            </div>
        );
    }
}

export default withRouter(App);
