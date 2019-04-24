import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { setSetupCompleted } from 'common/app-state';
import { logger } from 'common/logger';
import { ROUTES } from 'common/routing';

import {
    CalendarAuth,
    SelectRoom,
    Profile,
    SelectMedia
} from './../components/setup';
import { withCalendar } from './../loaders';

/**
 * Displays the Spot setup flow.
 *
 * @extends React.Component
 */
export class Setup extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        history: PropTypes.object,
        remoteControlService: PropTypes.object
    };

    /**
     * Initializes a new {@code Setup} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.steps = [
            SelectMedia,
            CalendarAuth,
            SelectRoom,
            Profile
        ];

        this.state = {
            currentStep: this.steps[0]
        };

        this._onNextStep = this._onNextStep.bind(this);
        this._onRedirectHome = this._onRedirectHome.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const CurrentStep = this.state.currentStep;

        return (
            <div className = 'container'>
                <div className = 'setup'>
                    <CurrentStep onSuccess = { this._onNextStep } />
                </div>
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
            this._onRedirectHome();
        } else {
            const nextStep = this._getNextStep();

            logger.log('setup going to next step',
                { next: nextStep.displayName || nextStep.name });

            this.setState({
                currentStep: nextStep
            });
        }
    }

    /**
     * Attempts to redirect back to home view after setup has been completed.
     *
     * @private
     * @returns {void}
     */
    _onRedirectHome() {
        this.props.history.push(ROUTES.HOME);
    }
}

export default withRouter(withCalendar(connect()(Setup)));
