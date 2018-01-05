import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setSetupCompleted } from 'actions';
import GoogleAuth from './google-auth';
import GoogleSelectRoom from './google-select-room';
import Welcome from './welcome';

export class Setup extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onCancel: PropTypes.func,
        onSuccess: PropTypes.func
    };

    constructor(props) {
        super(props);

        this._cancelSetup = this._cancelSetup.bind(this);
        this._nextStep = this._nextStep.bind(this);

        this.steps = [
            this._renderWelcome.bind(this),
            this._renderEnterAuth.bind(this),
            this._selectRoom.bind(this)
        ];

        this.state = {
            renderCurrentStep: this.steps[0]
        };
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

    _nextStep() {
        if (this._isOnLastStep()) {
            this.props.dispatch(setSetupCompleted(true));
            this.props.onSuccess && this.props.onSuccess();
        } else {
            this.setState({
                renderCurrentStep: this._getNextStep()
            });
        }
    }

    _renderEnterAuth() {
        return (
            <GoogleAuth onSuccess = { this._nextStep } />
        );
    }

    _renderWelcome() {
        return <Welcome onSuccess = { this._nextStep } />;
    }

    _selectRoom() {
        return (
            <GoogleSelectRoom onSuccess = { this._nextStep } />
        );
    }
}

export default connect()(Setup);
