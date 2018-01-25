import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import { Nav } from 'features/debug';
import { PrivateRoute } from 'routing';
import {
    Admin,
    Calendar,
    Loading,
    Meeting,
    RemoteControl,
    RemoteControlListener,
    Setup
} from 'views';

// eslint-disable-next-line no-undef
const showDebugNav = process.env.NODE_ENV !== 'production';

export class App extends React.Component {
    render() {
        return (
            <div>
                <Switch>
                    <PrivateRoute
                        path = '/admin'
                        component = { Admin } />
                    <PrivateRoute
                        path = '/meeting/:name'
                        component = { Meeting } />
                    <Route
                        path = '/setup'
                        component = { Setup } />
                    <Route
                        path = '/loading'
                        component = { Loading } />
                    <Route
                        path = '/connect'
                        component = { RemoteControlListener } />
                    <Route
                        path = '/remote-control/:remoteId'
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
