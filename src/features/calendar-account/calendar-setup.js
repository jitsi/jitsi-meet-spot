import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendar, setSetupCompleted } from 'actions';
import { google } from 'calendars';

export class CalendarSetup extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onCancel: PropTypes.func,
        onSuccess: PropTypes.func
    };

    constructor(props) {
        super(props);

        this._cancelSetup = this._cancelSetup.bind(this);
        this._getRoomCalendar = this._getRoomCalendar.bind(this);
        this._nextStep = this._nextStep.bind(this);
        this._onAuthEnter = this._onAuthEnter.bind(this);
        this._onApiKeyChange = this._onApiKeyChange.bind(this);
        this._onCliendIdChange = this._onCliendIdChange.bind(this);

        this.steps = [
            this._renderWelcome.bind(this),
            this._renderEnterAuth.bind(this),
            this._selectRoom.bind(this)
        ];

        this.state = {
            rooms: [],
            renderCurrentStep: this.steps[0],
            apiKey: '',
            clientId: ''
        }
    }

    render() {
        return (
            <div>
                <div className = 'content'>
                    { this.state.renderCurrentStep() }
                </div>
                <div className = 'nav'>
                    <button onClick = { this._cancelSetup }>
                        Cancel
                    </button>
                    <button onClick = { this._nextStep }>
                        Next
                    </button>
                </div>
            </div>
        );
    }

    _cancelSetup() {
        this.props.onCancel && this.props.onCancel();
    }

    _isOnLastStep() {
        return this.steps[this.steps.length - 1]
            === this.state.renderCurrentStep;
    }

    _getNextStep() {
        const currentStepIndex
            = this.steps.indexOf(this.state.renderCurrentStep);

        return this.steps[currentStepIndex + 1];
    }

    _getRoomCalendar(room) {
        const roomEmail = room.resourceEmail;
        return google.getCalendar(roomEmail)
            .then(events => {
                this.props.dispatch(setCalendar(roomEmail, events));
                this.props.dispatch(setSetupCompleted(
                    true,
                    this.state.apiKey,
                    this.state.clientId));
                this._nextStep();
            });

    }

    _nextStep() {
        if (this._isOnLastStep()) {
            this.props.onSuccess && this.props.onSuccess();
        } else {
            this.setState({
                renderCurrentStep: this._getNextStep()
            })
        }
    }

    _onApiKeyChange(event) {
        this.setState({
            apiKey: event.target.value
        });
    }

    _onAuthEnter() {
        return google.authenticate(this.state.apiKey, this.state.clientId)
            .then(() => google.getRooms())
            .then(rooms => {
                this.setState({ rooms });
                this._nextStep();
            })
            .catch(error => {
                console.warn('error', error);
            });
    }

    _onCliendIdChange(event) {
        this.setState({
            clientId: event.target.value
        });
    }

    _renderEnterAuth() {
        return (
            <div>
                <h1>Auth</h1>
                <input
                    onChange = { this._onApiKeyChange }
                    placeholder = 'API_KEY'
                    value = { this.state.apiKey } />
                <input
                    onChange = { this._onCliendIdChange }
                    placeholder = 'CLIENT_ID'
                    value = { this.state.clientId } />
                <button onClick = { this._onAuthEnter }>
                    Submit
                </button>
            </div>
        );
    }

    _renderErrorVerifying() {
        return (
            <div>
                <h1>Error</h1>
            </div>
        );
    }

   _renderSetupComplete() {
        return (
            <div>
                <h1>Complete</h1>
            </div>
        );
    }

    _renderVerifying() {
        return (
            <div>
                <h1>Verifying</h1>
            </div>
        );
    }

    _renderWelcome() {
        return (
            <div>
                <h1>Welcome</h1>
            </div>
        );
    }

    _selectRoom() {
        const rooms = this.state.rooms.map(room => {
            return (
                <button key = { room.etags }
                    onClick = { () => this._getRoomCalendar(room) }>
                    {room.resourceName}
                </button>
            )
        });

        return (
            <div>
                { rooms }
            </div>
        );
    }
}

export default connect()(CalendarSetup);
