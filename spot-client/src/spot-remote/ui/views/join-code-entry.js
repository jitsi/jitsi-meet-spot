import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    addNotification,
    getRemoteControlServerConfig,
    getShareDomain,
    isConnectedToSpot,
    setJoinCode
} from 'common/app-state';
import { ArrowForward, HelpOutline } from 'common/icons';
import { logger } from 'common/logger';
import { remoteControlService } from 'common/remote-control';
import { ROUTES } from 'common/routing';
import { CodeInput, Loading, View } from 'common/ui';

import { connectToSpotTV } from './../../app-state';
import { NavButton, NavContainer } from './../components';
import { withUltrasound } from './../loaders';

/**
 * Displays a view to enter a join code for connecting with a Spot-TV instance.
 *
 * @extends React.Component
 */
export class JoinCodeEntry extends React.Component {
    static defaultProps = {
        entryLength: 6
    };

    static propTypes = {
        dispatch: PropTypes.func,
        entryLength: PropTypes.number,
        history: PropTypes.object,
        isConnectedToSpot: PropTypes.bool,
        location: PropTypes.object,
        remoteControlConfiguration: PropTypes.object,
        shareDomain: PropTypes.string,
        ultrasoundService: PropTypes.object
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

        this._isShareModeEnabled = this._isInShareModeEnv();

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
        this.props.ultrasoundService.setMessage('');
        this.props.dispatch(setJoinCode(''));
        remoteControlService.disconnect();

        const { pathname } = this.props.location;
        const codeMatch = pathname.match(new RegExp('^/(\\w{6})$'));
        let code = codeMatch && codeMatch[1];

        if (!code && this.props.location.hash && this.props.location.hash.includes('#/?')) {
            const parts = this.props.location.hash.substr(3);
            const queryParams = new URLSearchParams(parts);

            code = queryParams.get('code');
        }

        if (code) {
            logger.log('joinCodeEntry detected a join code');

            this._connectToSpot(code);
        }
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
                            Your key is visible on the Spot TV
                        </div>
                    </div>
                    <div className = 'code-entry-wrapper'>
                        <form
                            onSubmit = { this._onFormSubmit }>
                            <div data-qa-id = { 'join-code-input' }>
                                <CodeInput onChange = { this._onCodeChange } />
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
            if (enteredCode.length === 6) {
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

        // Trigger ultrasound playing now to piggyback on the connect button tap
        // as workaround for mobile Safari requiring a user action to autoplay
        // any sound.
        this.props.ultrasoundService.setMessage(trimmedCode);

        submitPromise
            .then(() => this.props.dispatch(connectToSpotTV(trimmedCode, this._isShareModeEnabled)))
            .then(() => {
                logger.log('joinCodeEntry code is valid');

                this.setState({ validating: false });

                const redirectTo = this._isShareModeEnabled ? ROUTES.SHARE : ROUTES.REMOTE_CONTROL;

                this.props.history.push(redirectTo);
            })
            .catch(() => {
                this.setState({ validating: false });
                this.props.dispatch(addNotification('error', 'Something went wrong'));
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
        isConnectedToSpot: isConnectedToSpot(state),
        remoteControlConfiguration: getRemoteControlServerConfig(state),
        shareDomain: getShareDomain(state)
    };
}

export default withUltrasound(connect(mapStateToProps)(JoinCodeEntry));
