import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import { PrivateRoute } from 'routing';

import AdminView from 'views/admin';
import CalendarView from 'views/calendar';
import LoadingView from 'views/loading';
import MeetingView from 'views/meeting';
import SetupView from 'views/setup';

export class App extends React.Component {
    render() {
        return (
            <div>
                <Switch>
                    <PrivateRoute
                        path = '/admin'
                        component = { AdminView } />
                    <PrivateRoute
                        path = '/meeting/:name'
                        component = { MeetingView } />
                    <Route
                        path = '/setup'
                        component = { SetupView } />
                    <Route
                        path = '/loading'
                        component = { LoadingView } />
                    <PrivateRoute
                        component = { CalendarView } />
                </Switch>
            </div>
        );
    }
}

export default withRouter(App);
