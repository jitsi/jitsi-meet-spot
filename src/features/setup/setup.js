import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setSetupCompleted } from 'actions';
import GoogleAuth from './google-auth';
import GoogleSelectRoom from './google-select-room';
import Welcome from './welcome';

import styles from './setup.css';

export class Setup extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func
    };

    constructor(props) {
        super(props);

        this._nextStep = this._nextStep.bind(this);

        this.steps = [
            Welcome,
            GoogleAuth,
            GoogleSelectRoom
        ];

        this.state = {
            currentStep: this.steps[0]
        };
    }

    render() {
        const CurrentStep = this.state.currentStep;

        return (
            <div className = { styles.setup }>
                <CurrentStep onSuccess = { this._nextStep } />
            </div>
        );
    }

    _getNextStep() {
        const currentStepIndex
            = this.steps.indexOf(this.state.currentStep);

        return this.steps[currentStepIndex + 1];
    }

    _isOnLastStep() {
        return this.steps[this.steps.length - 1]
            === this.state.currentStep;
    }


    _nextStep() {
        if (this._isOnLastStep()) {
            this.props.dispatch(setSetupCompleted());
            this.props.onSuccess();
        } else {
            this.setState({
                currentStep: this._getNextStep()
            });
        }
    }
}

export default connect()(Setup);
