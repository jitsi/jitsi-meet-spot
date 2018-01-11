import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';

import { isLoadComplete, isSetupComplete } from 'reducers';

export class PrivateRoute extends React.Component {
    static propTypes = {
        _isLoadComplete: PropTypes.bool,
        _isSetupComplete: PropTypes.bool,
        component: PropTypes.func,
        location: PropTypes.object
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
        const { _isLoadComplete, _isSetupComplete, ...rest } = this.props;

        if (!_isLoadComplete) {
            return <Redirect
                to = {{
                    pathname: '/loading',
                    state: { referrer: this.props.location.pathname }
                }} />;
        }

        if (!_isSetupComplete) {
            return <Redirect to = {{ pathname: '/setup' }} />;
        }

        return <Route { ...rest } />;
    }
}

function mapStateToProps(state) {
    return {
        _isLoadComplete: isLoadComplete(state),
        _isSetupComplete: isSetupComplete(state)
    };
}

export default connect(mapStateToProps)(PrivateRoute);
