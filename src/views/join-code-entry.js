import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import ReactCodeInput from 'react-code-input';

import { addNotification, setLock, setRoomName } from 'actions';
import { Button } from 'features/button';
import { isConnectedToSpot } from 'reducers';
import { remoteControlService } from 'remote-control';
import { ROUTES } from 'routing';
import { logger } from 'utils';

import View from './view';
import styles from './view.css';

/**
 * Displays a view to enter a join code for connecting with a Spot instance.
 *
 * @extends React.Component
 */
export class JoinCodeEntry extends React.Component {
    static defaultProps = {
        entryLength: 8
    };

    static propTypes = {
        dispatch: PropTypes.func,
        entryLength: PropTypes.number,
        history: PropTypes.object,
        isConnectedToSpot: PropTypes.bool
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
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Ensures no Spot connection is running while trying to connect to another
     * instance of Spot.
     *
     * @inheritdoc
     */
    componentDidMount() {
        remoteControlService.disconnect();
    }

    /**
     * Redirects to the remote control view when a connection to Spot is
     * established.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (!prevProps.isConnectedToSpot && this.props.isConnectedToSpot) {
            this.props.history.push(ROUTES.REMOTE_CONTROL);
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <View
                hideBackground = { true }
                name = 'join-code'>
                <div className = { styles.container }>
                    {
                        this.state.validating
                            ? 'Connecting'
                            : <div>
                                <div data-qa-id = { 'join-code-input' }>
                                    <ReactCodeInput
                                        fields = { this.props.entryLength }
                                        onChange = { this._onCodeChange }
                                        type = 'text'
                                        value = { this.state.enteredCode } />
                                </div>
                                <Button
                                    data-qa-id = 'join-code-submit'
                                    onClick = { this._onSubmit }>
                                    Submit
                                </Button>
                            </div>
                    }
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
     * Callback invoked to validate the join code and connect to a Spot.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        const submitPromise = new Promise(resolve => {
            this.setState({ validating: true }, resolve);
        });

        // FIXME: There is no proper join code service so the code is a
        // combination of a 4 digit room name and a 4 digit room password.
        const roomName = this.state.enteredCode.substring(0, 4);
        const password = this.state.enteredCode.substring(4, 8);

        submitPromise
            .then(() => remoteControlService.exchangeCode(password))
            .then(() => {
                this.props.dispatch(setRoomName(roomName));
                this.props.dispatch(setLock(password));

                return remoteControlService.connect(
                    roomName,
                    password
                );
            })
            .catch(error => {
                logger.error('Error while connecting to spot:', error);

                this.props.dispatch(
                    addNotification('error', 'Something went wrong'));

                remoteControlService.disconnect();

                this.props.dispatch(setRoomName(''));
                this.props.dispatch(setLock(''));

                this.setState({ validating: false });
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
        isConnectedToSpot: isConnectedToSpot(state)
    };
}

export default connect(mapStateToProps)(JoinCodeEntry);
