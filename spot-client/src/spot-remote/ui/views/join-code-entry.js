import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { addNotification, setLock, setRoomName } from 'common/actions';
import { logger } from 'common/logger';
import {
    getRemoteControlServerConfig,
    isConnectedToSpot
} from 'common/reducers';
import { remoteControlService } from 'common/remote-control';
import { ROUTES } from 'common/routing';
import { View } from 'common/ui';
import { isAutoFocusSupported } from 'common/utils';

import { CodeInput, NavButton } from './../components';
import { withUltrasound } from './../loaders';

/**
 * Displays a view to enter a join code for connecting with a Spot instance.
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

        this._onCodeChange = this._onCodeChange.bind(this);
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Ensures no Spot connection is running while trying to connect to another
     * instance of Spot.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.ultrasoundService.setMessage('');
        this.props.dispatch(setRoomName(''));
        this.props.dispatch(setLock(''));
        remoteControlService.disconnect();

        const queryParams = new URLSearchParams(this.props.location.search);
        const code = queryParams.get('code');

        // Hide the code and other params for visual clarity only, no practical
        // purpose.
        this.props.history.replace(this.props.location.pathname);

        if (code) {
            logger.log('joinCodeEntry detect query param code');

            this._connectToSpot(code);
        }
    }

    /**
     * Redirects to the remote control view when a connection to Spot is
     * established.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (!prevProps.isConnectedToSpot && this.props.isConnectedToSpot) {
            logger.log('joinCodeEntry connection to spot established');

            this.props.history.push(ROUTES.REMOTE_CONTROL);
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        if (this.state.validating) {
            return (
                <View name = 'join-code-validating'>
                    <div className = 'connecting'>Connecting...</div>
                </View>
            );
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
                            onSubmit = { this._onSubmit }>
                            <div data-qa-id = { 'join-code-input' }>
                                <CodeInput
                                    autoFocus = { isAutoFocusSupported() }
                                    forceUppercase = { true }
                                    onChange = { this._onCodeChange }
                                    value = { this.state.enteredCode } />
                            </div>
                        </form>
                    </div>
                    <div className = 'nav'>
                        <NavButton
                            iconName = 'arrow_forward'
                            label = 'Continue'
                            onClick = { this._onSubmit }
                            qaId = 'join-code-submit'
                            tabIndex = { 0 } />
                    </div>
                </div>
            </View>
        );
    }

    /**
     * Callback invoked to update the known entered join code.
     *
     * @param {string} enteredCode - The entered code so far.
     * @private
     * @returns {void}
     */
    _onCodeChange(enteredCode) {
        this.setState({ enteredCode });
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
     * Callback invoked to validate the join code and connect to a Spot.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        this._connectToSpot(this.state.enteredCode);
    }

    /**
     * Validates the passed in code and starts the connection to the Spot.
     *
     * @param {string} code - The code for becoming a remote control to a Spot.
     * @private
     * @returns {void}
     */
    _connectToSpot(code) {
        const submitPromise = new Promise(resolve => {
            this.setState({ validating: true }, resolve);
        });
        const trimmedCode = code.trim().toLowerCase();

        // FIXME: There is no proper join code service so the code is a
        // combination of a 3 digit room name and a 3 digit room password.
        const roomName = trimmedCode.substring(0, 3);
        const password = trimmedCode.substring(3, 6);

        // Piggyback on the connect button tap as workaround for mobile Safari
        // requiring a user action to autoplay any sound.
        this.props.ultrasoundService.setMessage(trimmedCode);

        submitPromise
            .then(() => remoteControlService.exchangeCode(trimmedCode))
            .then(() => {
                logger.log('joinCodeEntry code is valid');

                this.props.dispatch(setRoomName(roomName));
                this.props.dispatch(setLock(password));

                this.props.history.push(ROUTES.REMOTE_CONTROL);
            })
            .catch(() => {
                this.setState({ validating: false });

                this.props.dispatch(
                    addNotification('error', 'Something went wrong'));
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
        remoteControlConfiguration: getRemoteControlServerConfig(state)
    };
}

export default withUltrasound(connect(mapStateToProps)(JoinCodeEntry));
