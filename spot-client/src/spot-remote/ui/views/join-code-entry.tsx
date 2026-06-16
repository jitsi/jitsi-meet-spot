
import type { RootState } from 'common/app-state';
import {
    addNotification,
    getProductName,
    getShareDomain,
    sendApiMessage
} from 'common/app-state';
import { getPermanentPairingCode, isBackendEnabled } from 'common/backend';
import { isSpotControllerApp } from 'common/detection';
import { HelpOutline } from 'common/icons';
import { logger } from 'common/logger';
import { ROUTES, withRouter } from 'common/routing';
import { Button, CodeInput, Loading, View } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import {
    connectToSpotTV,
    disconnectFromSpotTV,
    getApiReceivedJoinCode,
    isOnboardingComplete,
    setAPiReceivedJoinCode
} from './../../app-state';

/**
 * The props of {@code JoinCodeEntry}.
 */
interface IProps {
    apiReceivedJoinCode?: string;
    clearApiReceivedJoinCode: () => void;
    codeLength: number;
    completedOnboarding?: boolean;
    history: any;
    location: any;
    onAddNotification: (type: string, message: string) => void;
    onConnectToSpotTV: (joinCode: string, shareMode: boolean) => Promise<any>;
    onDisconnect: () => void;
    permanentPairingCode?: string;
    productName?: string;
    sendJoinCodeNeeded: () => void;
    shareDomain?: string;
    t: (key: string, options?: any) => string;
    updateReadyStatus: (ready: boolean) => void;
}

/**
 * The state of {@code JoinCodeEntry}.
 */
interface IState {
    enteredCode: string;
    validating?: boolean;
}

/**
 * Displays a view to enter a join code for connecting with a Spot-TV instance.
 */
export class JoinCodeEntry extends React.Component<IProps, IState> {
    static defaultProps = {
        codeLength: 8
    };

    /**
     * Initializes a new {@code JoinCodeEntry} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
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
            const parts = this.props.location.hash.slice(3);
            const queryParams = new URLSearchParams(parts);

            code = queryParams.get('code');
        }

        if (this._isInShareModeEnv() && isSpotControllerApp()) {
            this.props.history.push(ROUTES.SHARE_HELP);

            return;
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

        // By this time, we determined that we're waiting for
        // a join code to be entered, so we're telling it to the
        // API to react (if need be).
        this.props.sendJoinCodeNeeded();
    }

    /**
     * Implements {@code React#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps: IProps) {
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

        const {
            codeLength,
            productName,
            t
        } = this.props;

        return (
            <View name = 'join-code'>
                <div className = 'join-code-view'>
                    <div className = 'cta'>
                        <div className = 'title'>
                            { t('join.enterCode') }
                        </div>
                        <div className = 'help'>
                            { t('join.visibleAt', { productName }) }
                        </div>
                    </div>
                    <div className = { `code-entry-wrapper boxes-${codeLength}` }>
                        <form
                            onSubmit = { this._onFormSubmit }>
                            <div
                                className = 'join-code-input'
                                data-qa-id = { 'join-code-input' }>
                                <CodeInput
                                    length = { codeLength }
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
                    <div className = 'join-button-bar'>
                        <Button
                            onClick = { this._onSubmit }
                            qaId = 'join-code-submit'>
                            { t('buttons.continue') }
                        </Button>
                    </div>
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
     * @param enteredCode - The entered code so far.
     * @private
     * @returns {void}
     */
    _onCodeChange(enteredCode: string) {
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
     * @param event - The React synthetic event from a form
     * submission.
     * @private
     * @returns {void}
     */
    _onFormSubmit(event: React.FormEvent) {
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
     * @param code - The code for becoming a remote to a Spot-TV.
     * @private
     * @returns {void}
     */
    _connectToSpot(code: string) {
        const submitPromise = new Promise<void>(resolve => {
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
                    this.props.onAddNotification('error', 'appEvents.invalidShareKey');
                } else {
                    this.props.onAddNotification('error', 'appEvents.genericError');
                }

                this.props.history.push(ROUTES.CODE);
            });
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code JoinCodeEntry}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        apiReceivedJoinCode: getApiReceivedJoinCode(state),
        codeLength: isSpotControllerApp() && isBackendEnabled(state) ? 8 : 6,
        completedOnboarding: isOnboardingComplete(state),
        permanentPairingCode: getPermanentPairingCode(state),
        productName: getProductName(state),
        shareDomain: getShareDomain(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        /**
         * Clears the API code received through the API.
         *
         * @returns {void}
         */
        clearApiReceivedJoinCode() {
            dispatch(setAPiReceivedJoinCode(undefined as unknown as string));
        },

        /**
         * Display an app notification.
         *
         * @param type - The type of the notification to display.
         * @param message - The text to display in the notification.
         * @returns {void}
         */
        onAddNotification(type: string, message: string) {
            dispatch(addNotification(type, message));
        },

        /**
         * Attempts to establish a connection with a Spot-TV.
         *
         * @param joinCode - The code necessary to pair with a Spot-TV.
         * @param shareMode - If is in the special screensharing mode.
         * @returns {Promise} Resolves when the connection is established.
         */
        onConnectToSpotTV(joinCode: string, shareMode: boolean) {
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
         * Tells the API that the remote is waiting for a join code.
         *
         * @returns {void}
         */
        sendJoinCodeNeeded() {
            dispatch(sendApiMessage('joinCodeNeeded', undefined));
        },

        /**
         * Updates the ready status of the app, telling the API (embedder) that we're ready to receive
         * a join code.
         *
         * @param ready - True if the app is ready to receive a join code through the API.
         * @returns {void}
         */
        updateReadyStatus(ready: boolean) {
            dispatch(sendApiMessage('joinReady', ready));
        }
    };
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(
        withTranslation()(JoinCodeEntry)
    )
);
