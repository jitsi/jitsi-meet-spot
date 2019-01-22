import PropTypes from 'prop-types';
import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import { Notifications } from 'features/notifications';
import { ErrorBoundary } from 'features/error-boundary';
import { IdleCursorDetector } from 'features/idle-cursor-detector';
import { ROUTES } from 'routing';
import {
    Admin,
    FatalError,
    Home,
    JoinCodeEntry,
    Meeting,
    RemoteControl,
    Setup
} from 'views';

import styles from './app.css';

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
     * Initializes a new {@code App} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            hideCursor: false
        };

        this._onCursorIdleChange = this._onCursorIdleChange.bind(this);
    }

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
        if (this._isOauthRedirect()) {
            window.opener.postMessage({
                type: 'ms-login',
                url: window.location.href
            }, window.location.origin);

            return <div> Auth successful! </div>;
        }

        return (
            <IdleCursorDetector
                onCursorIdleChange = { this._onCursorIdleChange }>
                <div
                    className = {
                        this.state.hideCursor ? styles.idleCursor : '' }>
                    <Notifications />
                    <ErrorBoundary errorComponent = { FatalError }>
                        <Switch>
                            {

                                /**
                                 * Spot instance specific routes.
                                 */
                            }
                            <Route
                                component = { Admin }
                                path = { ROUTES.ADMIN } />
                            <Route
                                component = { Meeting }
                                path = { ROUTES.MEETING } />
                            <Route
                                component = { Setup }
                                path = { ROUTES.SETUP } />
                            <Route
                                component = { Home }
                                path = { ROUTES.HOME } />
                            {

                                /**
                                 * Remote control specific routes.
                                 */
                            }
                            <Route
                                component = { RemoteControl }
                                path = { ROUTES.REMOTE_CONTROL } />
                            <Route component = { JoinCodeEntry } />
                        </Switch>
                    </ErrorBoundary>
                </div>
            </IdleCursorDetector>
        );
    }

    /**
     * The hack used to detect when the page is being loaded as a result of an
     * oath flow redirect from a third-party calendar service. This hack is
     * implemented during the time when no deployment strategy is known and no
     * server-side routing is set up to handle a proper oauth landing page.
     *
     * @private
     * @returns {boolean}
     */
    _isOauthRedirect() {
        // Outlook auth redirect URL cannot be a direct hash route. The
        // workaround implemented is redirecting to the home route but detecting
        // when it might be a oauth redirect.
        return Boolean(window.opener
            && this.props.location.pathname.includes('access_token'));
    }

    /**
     * Callback invoked to update the known idle state of the cursor.
     *
     * @param {boolean} cursorIsIdle - Whether or not the cursor is idle.
     * @private
     * @returns {void}
     */
    _onCursorIdleChange(cursorIsIdle) {
        this.setState({ hideCursor: cursorIsIdle });
    }
}

export default withRouter(App);
