import PropTypes from 'prop-types';
import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import { logger } from 'common/logger';
import { ROUTES } from 'common/routing';
import {
    ErrorBoundary,
    FatalError,
    IdleCursorDetector,
    Notifications
} from 'common/ui';
import { JoinCodeEntry, RemoteControl } from 'spot-remote/ui';
import {
    Admin,
    Home,
    Meeting,
    Setup,
    WiredScreenshareDetector
} from 'spot-tv/ui';
import { SpotTVRemoteControlLoader } from './spot-tv/ui/loaders';

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
            hideCursor: true
        };

        this._onCursorIdleChange = this._onCursorIdleChange.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);

        this._renderAdminView = this._renderAdminView.bind(this);
        this._renderHomeView = this._renderHomeView.bind(this);
        this._renderMeetingView = this._renderMeetingView.bind(this);
        this._renderSetupView = this._renderSetupView.bind(this);
    }

    /**
     * Adds event listeners that modify app behavior or appearance.
     *
     * @inheritdoc
     */
    componentDidMount() {
        logger.log(`App mounted in ${window.performance.now()} on ${
            window.navigator.userAgent}`);

        /**
         * Defer touch actions to web to handle instead of the mobile device.
         */
        document.addEventListener('touchstart', this._onTouchStart, true);

        /**
         * First half of the hack to prevent outline styles from displaying
         * while using a mouse to navigate but show them when using a keyboard.
         * Hide outlines when the mouse is being used so clicking does not
         * outline anything.
         */
        document.body.addEventListener('mousedown', this._onMouseDown);

        /**
         * Second half of the hack to prevent outline styles from displaying
         * while using a mouse to navigate but show them when using a keyboard.
         * Show outlines when the keyboard is being used so tabbing does
         * outline the focused element.
         */
        document.body.addEventListener('keydown', this._onKeyDown);
    }

    /**
     * Removes event listeners that modify app behavior or appearance.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        document.removeEventListener('touchstart', this._onTouchStart);
        document.removeEventListener('mousedown', this._onMouseDown);
        document.removeEventListener('keydown', this._onKeyDown);
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

        const rootClassName
            = `app ${this.state.hideCursor ? 'idleCursor' : ''}`;

        return (
            <ErrorBoundary errorComponent = { FatalError }>
                <WiredScreenshareDetector />
                <IdleCursorDetector
                    onCursorIdleChange = { this._onCursorIdleChange }>
                    <div className = { rootClassName }>

                        <Notifications />
                        <Switch>
                            {

                                /**
                                 * Spot instance specific routes.
                                 */
                            }
                            <Route
                                path = { ROUTES.ADMIN }
                                render = { this._renderAdminView } />
                            <Route
                                path = { ROUTES.MEETING }
                                render = { this._renderMeetingView } />
                            <Route
                                path = { ROUTES.SETUP }
                                render = { this._renderSetupView } />
                            <Route
                                path = { ROUTES.HOME }
                                render = { this._renderHomeView } />

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
                    </div>
                </IdleCursorDetector>
            </ErrorBoundary>
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

    /**
     * Callback invoked when keyboard event occurs so outline styles can be
     * shown.
     *
     * @private
     * @returns {void}
     */
    _onKeyDown() {
        document.body.classList.remove('using-mouse');
    }

    /**
     * Callback invoked when a click occurs so outline styles can be hidden.
     *
     * @private
     * @returns {void}
     */
    _onMouseDown() {
        document.body.classList.add('using-mouse');
    }

    /**
     * Callback invoked on touch event.
     *
     * @private
     * @returns {void}
     */
    _onTouchStart() {
        /** no-op */
    }

    /**
     * Returns the Spot TV admin view.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderAdminView() {
        return this._renderSpotViewWithRemoteControl(Admin);
    }

    /**
     * Returns the Spot TV home (calendar) view.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderHomeView() {
        return this._renderSpotViewWithRemoteControl(Home);
    }

    /**
     * Returns the Spot TV in-meeting view.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderMeetingView() {
        return this._renderSpotViewWithRemoteControl(Meeting);
    }

    /**
     * Returns the Spot TV setup view.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderSetupView() {
        return this._renderSpotViewWithRemoteControl(Setup);
    }

    /**
     * Helper to ensure all Spot TV views share the same wrapper responsible
     * for maintaining the remote control service.
     *
     * @param {ReactComponent} View - The child to display within the remote
     * control service loader.
     * @private
     * @returns {ReactComponent}
     */
    _renderSpotViewWithRemoteControl(View) {
        return (
            <SpotTVRemoteControlLoader>
                <View />
            </SpotTVRemoteControlLoader>
        );
    }
}

export default withRouter(App);
