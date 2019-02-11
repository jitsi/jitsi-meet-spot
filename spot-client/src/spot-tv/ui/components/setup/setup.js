import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setSetupCompleted } from 'common/actions';

import CalendarAuth from './calendar-auth';
import ScreenshareInput from './screenshare-input';
import SelectRoom from './select-room';
import Welcome from './welcome';
import { logger } from '../../../../common/logger';

/**
 * Displays the Spot setup flow by handling display of each setup step.
 *
 * @extends React.Component
 */
export class Setup extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        onSuccess: PropTypes.func
    };

    /**
     * Initializes a new {@code Setup} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onNextStep = this._onNextStep.bind(this);

        this.steps = [
            Welcome,
            CalendarAuth,
            SelectRoom,
            ScreenshareInput
        ];

        this.state = {
            currentStep: this.steps[0]
        };
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const CurrentStep = this.state.currentStep;

        return (
            <div className = 'setup'>
                <CurrentStep onSuccess = { this._onNextStep } />
            </div>
        );
    }

    /**
     * Returns the React {@code Component} that should be displayed after the
     * currently displayed step.
     *
     * @private
     * @returns {ReactComponent}
     */
    _getNextStep() {
        const currentStepIndex
            = this.steps.indexOf(this.state.currentStep);

        return this.steps[currentStepIndex + 1];
    }

    /**
     * Checks if the currently displayed step is the final step of setup.
     *
     * @private
     * @returns {boolean} True if the final setup step is currently displayed.
     */
    _isOnLastStep() {
        return this.steps[this.steps.length - 1]
            === this.state.currentStep;
    }

    /**
     * Displays the next step of the setup flow or signals setup has been
     * completed.
     *
     * @private
     * @returns {void}
     */
    _onNextStep() {
        if (this._isOnLastStep()) {
            logger.log('setup completed');

            this.props.dispatch(setSetupCompleted());
            this.props.onSuccess();
        } else {
            const nextStep = this._getNextStep();

            logger.log(`setup going to next step ${
                nextStep.displayName || nextStep.name}`);

            this.setState({
                currentStep: nextStep
            });
        }
    }
}

export default connect()(Setup);
