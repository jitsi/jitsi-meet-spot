import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
    addNotification,
    getProductName,
    getShareDomain,
    sendApiMessage
} from 'common/app-state';
import { getPermanentPairingCode, isBackendEnabled } from 'common/backend';
import { isSpotControllerApp } from 'common/detection';
import { ArrowForward, HelpOutline } from 'common/icons';
import { logger } from 'common/logger';
import { ROUTES } from 'common/routing';
import { CodeInput, Loading, View } from 'common/ui';

import {
    connectToSpotTV,
    getApiReceivedJoinCode,
    disconnectFromSpotTV,
    isOnboardingComplete,
    setAPiReceivedJoinCode
} from './../../app-state';
import { NavButton, NavContainer } from './../components';

/**
 * Displays a view to enter a join code for connecting with a Spot-TV instance.
 *
 * @extends React.Component
 */
export class JoinCodeEntry extends React.Component {
    static defaultProps = {
        codeLength: 8
    };

    static propTypes = {
        apiReceivedJoinCode: PropTypes.string,
        clearApiReceivedJoinCode: PropTypes.func,
        codeLength: PropTypes.number,
        completedOnboarding: PropTypes.bool,
        history: PropTypes.object,
        location: PropTypes.object,
        onAddNotification: PropTypes.func,
        onConnectToSpotTV: PropTypes.func,
        onDisconnect: PropTypes.func,
        permanentPairingCode: PropTypes.string,
        productName: PropTypes.string,
        shareDomain: PropTypes.string,
        updateReadyStatus: PropTypes.func
    };

    /**
     * Initializes a new {@code JoinCodeEntry} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            enteredCode: ''
        };

        this._onCodeChange = this._onCodeChange.bind(this);
        this._onHelpIconClicked = this._onHelpIconClicked.bind(this);
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Ensures no Spot-TV connection is running while trying to connect to
     * another instance of Spot-TV. Parses the URL for any additional
     * functionality which should trigger automatically.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.updateReadyStatus(true);
        this.props.onDisconnect();

        const { pathname } = this.props.location;
        const codeMatch = pathname.match(new RegExp('^/(\\w{8})|(\\w{6})$'));

        let code = codeMatch && (codeMatch[1] || codeMatch[2]);

        if (!code && this.props.location.hash && this.props.location.hash.includes('#/?')) {
            const parts = this.props.location.hash.substr(3);
            const queryParams = new URLSearchParams(parts);

            code = queryParams.get('code');
        }

        if (!code) {
            code = this.props.permanentPairingCode;

            if (code) {
                logger.log('Restored permanent pairing code', { code });
            }
        }

        if (code) {
            logger.log('joinCodeEntry detected a join code', { code });

            this._connectToSpot(code);

            return;
        }

        if (this._shouldRedirectToHelp()) {
            this.props.history.push(ROUTES.HELP);

            return;
        }
    }

    /**
     * Implements {@code React#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        const { apiReceivedJoinCode } = this.props;

        if (apiReceivedJoinCode && prevProps.apiReceivedJoinCode !== apiReceivedJoinCode) {
            // remove the code, we don't need it anymore
            this.props.clearApiReceivedJoinCode();

            this._connectToSpot(apiReceivedJoinCode);
        }
    }

    /**
     * Implements {@code Component#componentWillUnmount}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.updateReadyStatus(false);
    }

    /**
     * Whether or not to exit from the {@code JoinCodeEntry} and instead show
     * app help.
     *
     * @returns {boolean}
     */
    _shouldRedirectToHelp() {
        return isSpotControllerApp() && !this.props.completedOnboarding;
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        if (this.state.validating) {
            return <Loading />;
        }

        return (
            <View name = 'join-code'>
                <div className = 'join-code-view'>
                    <div className = 'cta'>
                        <div className = 'title'>
                            Enter a share key
                        </div>
                        <div className = 'help'>
                            Your key is visible on the { this.props.productName } TV
                        </div>
                    </div>
                    <div className = { `code-entry-wrapper boxes-${this.props.codeLength}` }>
                        <form
                            onSubmit = { this._onFormSubmit }>
                            <div data-qa-id = { 'join-code-input' }>
                                <CodeInput
                                    length = { this.props.codeLength }
                                    onChange = { this._onCodeChange } />
                                {

                                    /**
                                     * Hidden submit exists to capture enter
                                     * presses to submit the form.
                                     */
                                }
                                <input
                                    className = 'hidden-submit'
                                    tabIndex = { -1 }
                                    type = 'submit' />
                            </div>
                        </form>
                    </div>
                    <NavContainer>
                        <NavButton
                            label = 'Continue'
                            onClick = { this._onSubmit }
                            qaId = 'join-code-submit'
                            tabIndex = { 0 }>
                            <ArrowForward />
                        </NavButton>
                    </NavContainer>
                    <HelpOutline
                        className = 'help-icon'
                        onClick = { this._onHelpIconClicked } />
                </div>
            </View>
        );
    }

    /**
     * Whether or not a successful connection to a Spot-TV should proceed into
     * share mode.
     *
     * @private
     * @returns {boolean}
     */
    _isInShareModeEnv() {
        const isShareDomain = this.props.shareDomain && window.location.host.includes(this.props.shareDomain);

        if (isShareDomain) {
            return true;
        }

        const queryParams = new URLSearchParams(this.props.location.search);

        return queryParams.get('share') === 'true';
    }

    /**
     * Redirects the user to the help page.
     *
     * @private
     * @returns {void}
     */
    _onHelpIconClicked() {
        this.props.history.push(ROUTES.HELP);
    }

    /**
     * Callback invoked to update the known entered join code.
     *
     * @param {string} enteredCode - The entered code so far.
     * @private
     * @returns {void}
     */
    _onCodeChange(enteredCode) {
        this.setState({ enteredCode }, () => {
            if (enteredCode.length === this.props.codeLength) {
                this._onSubmit();
            }
        });
    }

    /**
     * Callback invoked when the join code form has been submitted through the
     * enter key.
     *
     * @param {FocusEvent} event - The React synthetic event from a form
     * submission.
     * @private
     * @returns {void}
     */
    _onFormSubmit(event) {
        event.preventDefault();

        this._onSubmit();
    }

    /**
     * Callback invoked to validate the join code and connect to a Spot-TV.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        this._connectToSpot(this.state.enteredCode);
    }

    /**
     * Validates the passed in code and starts the connection to the Spot-TV.
     *
     * @param {string} code - The code for becoming a remote to a Spot-TV.
     * @private
     * @returns {void}
     */
    _connectToSpot(code) {
        const submitPromise = new Promise(resolve => {
            this.setState({ validating: true }, resolve);
        });
        const trimmedCode = code.trim().toLowerCase();

        submitPromise
            .then(() => this.props.onConnectToSpotTV(trimmedCode, this._isInShareModeEnv()))
            .then(() => {
                logger.log('joinCodeEntry code is valid', { code: trimmedCode });

                this.setState({ validating: false });

                const redirectTo = this._isInShareModeEnv() ? ROUTES.SHARE : ROUTES.REMOTE_CONTROL;

                this.props.history.push(redirectTo);
            })
            .catch(error => {
                logger.error('Failed to connect to Spot TV', {
                    code: trimmedCode,
                    error
                });

                this.setState({ validating: false });

                // In the wrong password case return back to join code entry.
                if (error === 'not-authorized') {
                    this.props.onAddNotification('error', 'Invalid share key');
                } else {
                    this.props.onAddNotification('error', 'Something went wrong');
                }

                this.props.history.push(ROUTES.CODE);
            });
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code JoinCodeEntry}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        apiReceivedJoinCode: getApiReceivedJoinCode(state),
        codeLength: isSpotControllerApp(state) && isBackendEnabled(state) ? 8 : 6,
        completedOnboarding: isOnboardingComplete(state),
        permanentPairingCode: getPermanentPairingCode(state),
        productName: getProductName(state),
        shareDomain: getShareDomain(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Clears the API code received through the API.
         *
         * @returns {void}
         */
        clearApiReceivedJoinCode() {
            dispatch(setAPiReceivedJoinCode());
        },

        /**
         * Display an app notification.
         *
         * @param {string} type - The type of the notification to display.
         * @param {string} message - The text to display in the notification.
         * @returns {void}
         */
        onAddNotification(type, message) {
            dispatch(addNotification(type, message));
        },

        /**
         * Attempts to establish a connection with a Spot-TV.
         *
         * @param {string} joinCode - The code necessary to pair with a Spot-TV.
         * @param {boolean} shareMode - If is in the special screensharing mode.
         * @returns {Promise} Resolves when the connection is established.
         */
        onConnectToSpotTV(joinCode, shareMode) {
            return dispatch(connectToSpotTV(joinCode, shareMode));
        },

        /**
         * Stop any existing connection to a Spot-TV.
         *
         * @returns {void}
         */
        onDisconnect() {
            dispatch(disconnectFromSpotTV());
        },

        /**
         * Updates the ready status of the app, telling the API (embedder) that we're ready to receive
         * a join code.
         *
         * @param {boolean} ready - True if the app is ready to receive a join code through the API.
         * @returns {void}
         */
        updateReadyStatus(ready) {
            dispatch(sendApiMessage('joinReady', ready));
        }
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(JoinCodeEntry));
