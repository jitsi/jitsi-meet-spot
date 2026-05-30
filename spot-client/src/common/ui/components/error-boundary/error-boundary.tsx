import { errorBoundaryDisplayed } from 'common/app-state/ui';
import { logger } from 'common/logger';
import React from 'react';
import type { ErrorInfo } from 'react';
import { connect } from 'react-redux';

interface IProps {
    children?: any;
    errorComponent?: any;
    onErrorBoundaryDisplayed?: (error: Error, info: ErrorInfo) => void;
}

interface IState {
    error: Error | null;
    info?: ErrorInfo;
}

/**
 * A component for catching uncaught errors and displaying an error message.
 */
export class ErrorBoundary extends React.Component<IProps, IState> {
    state: IState = {
        error: null,
        info: undefined
    };

    /**
     * Implements React's {@link Component#componentDidCatch()}.
     *
     * @inheritdoc
     */
    componentDidCatch(error: Error, info: ErrorInfo) {
        logger.error('error boundary triggered', {
            error,
            info
        });

        this.props.onErrorBoundaryDisplayed?.(error, info);

        this.setState({
            error,
            info
        });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        if (!this.state.error) {
            return this.props.children;
        }

        const ErrorComponent = this.props.errorComponent;

        return (
            <ErrorComponent
                error = { this.state.error }
                info = { this.state.info } />
        );
    }
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
         * Dispatches the {@link errorBoundaryDisplayed} action.
         *
         * @param error - The error.
         * @param info - Any extra info as defined by React's {@code ErrorInfo} type.
         * @returns {void}
         */
        onErrorBoundaryDisplayed(error: Error, info: ErrorInfo) {
            dispatch(errorBoundaryDisplayed(error, info));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(ErrorBoundary);
