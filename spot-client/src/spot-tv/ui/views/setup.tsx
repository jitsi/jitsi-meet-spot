
import { getStartParams, setSetupCompleted } from 'common/app-state';
import { isBackendEnabled } from 'common/backend';
import { logger } from 'common/logger';
import { ROUTES } from 'common/routing';
import { Modal } from 'common/ui';
import { getBoolean } from 'common/utils';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { withCalendar } from '../loaders';

import {
    PairRemote,
    Profile,
    SelectMedia,
    SyncWithBackend
} from './../components/setup';

interface IProps {
    dispatch?: (action: any) => any;
    history?: any;
    isBackendEnabled?: boolean;
    skipPairRemote?: boolean;
    skipSelectMedia?: boolean;
}

interface IState {
    currentStep: React.ComponentType<any>;
}

/**
 * Displays the Spot-TV setup flow.
 */
export class Setup extends React.Component<IProps, IState> {
    steps: React.ComponentType<any>[];

    /**
     * Initializes a new {@code Setup} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        const { isBackendEnabled: backendEnabled, skipPairRemote, skipSelectMedia } = props;

        this.steps = [];

        if (backendEnabled) {
            this.steps.push(SyncWithBackend);
        }
        if (!backendEnabled) {
            this.steps.push(Profile);
        }
        if (!skipSelectMedia) {
            this.steps.push(SelectMedia);
        }
        if (backendEnabled && !skipPairRemote) {
            this.steps.push(PairRemote);
        }

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
            <div className = 'setup'>
                <Modal>
                    <CurrentStep onSuccess = { this._onNextStep } />
                </Modal>
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
     * @returns True if the final setup step is currently displayed.
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
     * @returns
     */
    _onNextStep() {
        if (this._isOnLastStep()) {
            logger.log('setup completed');

            this.props.dispatch?.(setSetupCompleted());
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
     * @returns
     */
    _onRedirectHome() {
        this.props.history?.push(ROUTES.HOME);
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code Setup}.
 *
 * @param state - The Redux state.
 * @private
 * @returns
 */
function mapStateToProps(state: any) {
    const { skipPairRemote, skipSelectMedia } = getStartParams(state);

    return {
        isBackendEnabled: isBackendEnabled(state),
        skipPairRemote: getBoolean(skipPairRemote),
        skipSelectMedia: getBoolean(skipSelectMedia)
    };
}

export default withRouter(withCalendar(connect(mapStateToProps)(Setup)));
