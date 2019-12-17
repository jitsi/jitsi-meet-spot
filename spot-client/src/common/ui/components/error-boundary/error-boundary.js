import PropTypes from 'prop-types';
import React from 'react';

import { logger } from 'common/logger';
import { errorBoundaryDisplayed } from 'common/app-state/ui';
import { connect } from 'react-redux';

/**
 * A component for catching uncaught errors and displaying an error message.
 *
 * @extends React.Component
 */
export class ErrorBoundary extends React.Component {
    static propTypes = {
        children: PropTypes.any,
        errorComponent: PropTypes.any,
        onErrorBoundaryDisplayed: PropTypes.func
    };

    state = {
        error: null,
        info: undefined
    };

    /**
     * Implements React's {@link Component#componentDidCatch()}.
     *
     * @inheritdoc
     */
    componentDidCatch(error, info) {
        logger.error('error boundary triggered', {
            error,
            info
        });

        this.props.onErrorBoundaryDisplayed(error, info);

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
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Dispatches the {@link errorBoundaryDisplayed} action.
         *
         * @param {Error} error - The error.
         * @param {ErrorInfo} info - Any extra info as defined by React's {@code ErrorInfo} type.
         * @returns {void}
         */
        onErrorBoundaryDisplayed(error, info) {
            dispatch(errorBoundaryDisplayed(error, info));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(ErrorBoundary);
