import PropTypes from 'prop-types';
import React from 'react';

import { logger } from './../../../utils';

/**
 * A component for catching uncaught errors and displaying an error message.
 *
 * @extends React.Component
 */
export default class ErrorBoundary extends React.Component {
    static propTypes = {
        children: PropTypes.any,
        errorComponent: PropTypes.any
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
        logger.error('Error boundary caught an error:', error);
        logger.error('Component statck for above error:', info);

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
        return this.state.error
            ? this.props.errorComponent(this.state.error, this.state.info)
            : this.props.children;
    }
}
