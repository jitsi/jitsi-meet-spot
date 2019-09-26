import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

import {
    apiMessageReceived,
    getProductName,
    getSpotClientVersion,
    setBootstrapComplete
} from 'common/app-state';
import { logger } from 'common/logger';
import { ROUTES } from 'common/routing';
import {
    ErrorBoundary,
    FatalError,
    FeedbackOpener,
    FeedbackOverlay,
    IdleCursorDetector,
    ModalManager,
    Notifications
} from 'common/ui';
import { Help, JoinCodeEntry, RemoteControl, ShareView } from 'spot-remote/ui';
import {
    Home,
    Meeting,
    OutlookOauth,
    Setup,
    SpotView,
    UnsupportedBrowser,
    WiredScreenshareDetector
} from 'spot-tv/ui';
import { SpotTVRemoteControlLoader } from './spot-tv/ui/loaders';
import { SpotTvRestrictedRoute } from './spot-tv/routing';

/**
 * The root of the application which determines what view should be displayed.
 *
 * @extends React.Component
 */
export class App extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        location: PropTypes.object,
        productName: PropTypes.string,
        spotClientVersion: PropTypes.string
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
        this._onPostMessage = this._onPostMessage.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);

        this._renderHomeView = this._renderHomeView.bind(this);
        this._renderMeetingView = this._renderMeetingView.bind(this);
        this._renderSetupView = this._renderSetupView.bind(this);
        this._renderUnsupportedBrowserView
            = this._renderUnsupportedBrowserView.bind(this);

        this._renderHelpView = this._renderHelpView.bind(this);
        this._renderShareView = this._renderShareView.bind(this);
        this._renderJoinCodeEntry = this._renderJoinCodeEntry.bind(this);
        this._renderRemoteControlView = this._renderRemoteControlView.bind(this);
    }

    /**
     * Adds event listeners that modify app behavior or appearance.
     *
     * @inheritdoc
     */
    componentDidMount() {
        logger.log('App mounted', {
            duration: window.performance.now(),
            userAgent: window.navigator.userAgent,
            spotClientVersion: this.props.spotClientVersion
        });

        window.document.title = this.props.productName;

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

        /**
         * Instructions can be received through the iframe postMessage
         * event to instruct the remote or the spot TV to do something.
         */
        window.addEventListener('message', this._onPostMessage);

        this.props.dispatch(setBootstrapComplete());
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
        const rootClassName
            = `app ${this.state.hideCursor ? 'idleCursor' : ''}`;

        return (
            <ErrorBoundary errorComponent = { FatalError }>
                <IdleCursorDetector
                    onCursorIdleChange = { this._onCursorIdleChange }>
                    <div className = { rootClassName }>

                        <Notifications />
                        <Switch>
                            {

                                /**
                                 * Spot-TV specific routes.
                                 */
                            }
                            <SpotTvRestrictedRoute
                                path = { ROUTES.MEETING }
                                render = { this._renderMeetingView } />
                            <SpotTvRestrictedRoute
                                path = { ROUTES.OUTLOOK_OAUTH }
                                render = { this._renderOutlookOauthView } />
                            <SpotTvRestrictedRoute
                                path = { ROUTES.SETUP }
                                render = { this._renderSetupView }
                                requireSetup = { false } />
                            <Redirect
                                from = { ROUTES.OLD_HOME }
                                to = { ROUTES.HOME } />
                            <SpotTvRestrictedRoute
                                path = { ROUTES.HOME }
                                render = { this._renderHomeView } />
                            <Route
                                path = { ROUTES.UNSUPPORTED_BROWSER }
                                render = { this._renderUnsupportedBrowserView } />

                            {

                                /**
                                 * Spot-Remote specific routes.
                                 */
                            }
                            <Route
                                path = { ROUTES.HELP }
                                render = { this._renderHelpView } />
                            <Route
                                path = { ROUTES.SHARE }
                                render = { this._renderShareView } />
                            <Route
                                path = { ROUTES.REMOTE_CONTROL }
                                render = { this._renderRemoteControlView } />
                            <Route render = { this._renderJoinCodeEntry } />
                        </Switch>
                    </div>
                    <ModalManager />
                    <FeedbackOverlay />
                </IdleCursorDetector>
            </ErrorBoundary>
        );
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
     * Callback invoked on window 'message' event.
     *
     * @param {Object} event - The message event posted.
     * @returns {void}
     */
    _onPostMessage({ data }) {
        try {
            const parsedMessage = typeof data === 'object' ? data : JSON.parse(data);

            // A Jitsi API message needs to have a messageType and a messageData field, otherwise we ignore
            // handling it. Those messages may have arrived from other integrations, such as webpack.

            const { messageData, messageType } = parsedMessage;

            messageData && messageType && this.props.dispatch(apiMessageReceived(messageType, messageData));
        } catch (error) {
            logger.warn(`Unknown message received: '${data}'`, error);
        }
    }

    /**
     * Callback invoked on touch event.
     *
     * @private
     * @returns {void}
     */
    _onTouchStart() {
        /** No-op. */
    }

    /**
     * Returns the Spot-Remote help view.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderHelpView() {
        return this._renderSpotRemoteViewWithHelp(Help);
    }

    /**
     * Returns the Spot TV home (calendar) view.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderHomeView() {
        return this._renderSpotViewWithRemoteControl(Home, 'home');
    }

    /**
     * Returns the Spot-Remote join code entry view.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderJoinCodeEntry() {
        return this._renderSpotRemoteViewWithHelp(JoinCodeEntry);
    }

    /**
     * Returns the Spot TV in-meeting view.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderMeetingView() {
        return this._renderSpotViewWithRemoteControl(Meeting, 'meeting');
    }

    /**
     * Returns the Spot-TV view for processing an Outlook oauth redirect.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderOutlookOauthView() {
        return <OutlookOauth />;
    }

    /**
     * Returns the Spot-Remote remote control view.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderRemoteControlView() {
        return this._renderSpotRemoteViewWithHelp(RemoteControl);
    }

    /**
     * Returns the Spot TV setup view.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderSetupView() {
        return (
            <SpotView name = { 'setup' }>
                <Setup />
                <FeedbackOpener />
            </SpotView>
        );
    }

    /**
     * Returns the Spot-Remote share-only mode view.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderShareView() {
        return this._renderSpotRemoteViewWithHelp(ShareView);
    }

    /**
     * Helper for displaying a consistent view across Spot-Remote views.
     *
     * @param {Component} View - The Spot-Remove view component to show.
     * @returns {ReactElement}
     */
    _renderSpotRemoteViewWithHelp(View) {
        return (
            <div>
                <View />
                <FeedbackOpener />
            </div>
        );
    }

    /**
     * Helper to ensure all Spot TV views share the same wrapper responsible
     * for maintaining the remote control service.
     *
     * @param {ReactComponent} View - The child to display within the remote
     * control service loader.
     * @param {string} name - The name associate with the view. Used for remotes
     * to identify what view the spot is showing.
     * @private
     * @returns {ReactComponent}
     */
    _renderSpotViewWithRemoteControl(View, name) {
        return (
            <SpotTVRemoteControlLoader>
                <WiredScreenshareDetector />
                <SpotView name = { name }>
                    <View />
                </SpotView>
            </SpotTVRemoteControlLoader>
        );
    }

    /**
     * Returns the Spot-TV view to message that Spot-TV will not run in the
     * current environment.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderUnsupportedBrowserView() {
        return (
            <SpotView name = { 'unsupported' }>
                <UnsupportedBrowser />
            </SpotView>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code App}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        spotClientVersion: getSpotClientVersion(state),
        productName: getProductName(state)
    };
}

export default connect(mapStateToProps)(withRouter(App));
