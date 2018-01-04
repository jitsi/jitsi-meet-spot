import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

import { Nav } from 'features/nav';
import { isLoadComplete, isSetupComplete } from 'reducers';
import AdminView from 'views/admin';
import CalendarView from 'views/calendar';
import LoadingView from 'views/loading';
import MeetingView from 'views/meeting';
import SetupView from 'views/setup';

export class App extends React.Component {
    static propTypes = {
        _isSetupComplete: PropTypes.bool,
        _loadCompleted: PropTypes.bool
    };

    render() {
        const { _loadCompleted, _isSetupComplete } = this.props;

        return (
            <div>
                <Nav />
                <Switch>
                    <PrivateRoute
                        isInitialLoadComplete = { _loadCompleted }
                        isSetupComplete = { _isSetupComplete }
                        path = '/admin'
                        component = { AdminView } />
                    <PrivateRoute
                        isInitialLoadComplete = { _loadCompleted }
                        isSetupComplete = { _isSetupComplete }
                        path = '/meeting/:name'
                        component = { MeetingView } />
                    <Route
                        path = '/setup'
                        component = { SetupView } />
                    <Route
                        path = '/loading'
                        component = { LoadingView } />
                    <PrivateRoute
                        isInitialLoadComplete = { _loadCompleted }
                        isSetupComplete = { _isSetupComplete }
                        component = { CalendarView } />
                </Switch>
            </div>
        );
    }
}

class PrivateRoute extends React.Component {
    static propTypes = {
        component: PropTypes.func,
        isInitialLoadComplete: PropTypes.bool,
        isSetupComplete: PropTypes.bool
    }

    constructor(props) {
        super(props);

        this._renderRoute = this._renderRoute.bind(this);
    }

    render() {
        return (
            <Route render = { this._renderRoute } />
        );
    }

    _renderRoute() {
        const { isSetupComplete, isInitialLoadComplete, ...rest } = this.props;

        if (!isInitialLoadComplete) {
            return <Redirect to = '/loading' />;
        }

        if (!isSetupComplete) {
            return <Redirect to = {{ pathname: '/setup' }} />;
        }

        return <Route { ...rest } />;
    }
}

function mapStateToProps(state) {
    return {
        _isSetupComplete: isSetupComplete(state),
        _loadCompleted: isLoadComplete(state)
    };
}

export default withRouter(connect(mapStateToProps)(App));
