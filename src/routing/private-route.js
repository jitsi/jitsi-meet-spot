import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';

import { isLoadComplete, isSetupComplete } from 'reducers';

/**
 * A React Component wrapping {@code Route}, which prevents direct visiting of
 * a specified route until application loading and setup are complete.
 */
export class PrivateRoute extends React.Component {
    static propTypes = {
        _isLoadComplete: PropTypes.bool,
        _isSetupComplete: PropTypes.bool,
        component: PropTypes.func,
        location: PropTypes.object
    }

    /**
     * Initializes a new {@code PrivateRoute} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._renderRoute = this._renderRoute.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <Route render = { this._renderRoute } />
        );
    }

    /**
     * A render function which returns a {@code react-router-dom} component
     * depending on the current application load and setup state.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderRoute() {
        const { _isLoadComplete, _isSetupComplete, ...rest } = this.props;

        if (!_isLoadComplete) {
            return <Redirect
                to = {{
                    pathname: '/loading',
                    state: {
                        referrer: `${this.props.location.pathname}${
                            this.props.location.search}`
                    }
                }} />;
        }

        if (!_isSetupComplete) {
            return <Redirect to = {{ pathname: '/setup' }} />;
        }

        return <Route { ...rest } />;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code PrivateRoute}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        _isLoadComplete: isLoadComplete(state),
        _isSetupComplete: isSetupComplete(state)
    };
}

export default connect(mapStateToProps)(PrivateRoute);
