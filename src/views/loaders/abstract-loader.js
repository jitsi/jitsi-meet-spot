import PropTypes from 'prop-types';

import React from 'react';
import Loading from './loading';

/**
 * An abstract class with templates for how to ensure a service is loaded
 * for child components to use.
 *
 * @abstract
 * @extends React.Component
 */
export class AbstractLoader extends React.Component {
    /**
     * Initializes a new {@code ResetState} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            loaded: false
        };
    }

    /**
     * Initializes the application service if not already initialized.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._loadService()
            .then(() => this.setState({ loaded: true }));
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (this.state.loaded) {
            return this.props.children;
        }

        return <Loading />;
    }

    /**
     * Initializes the application service.
     *
     * @abstract
     * @returns {Promise}
     */
    _loadService() {
        throw new Error('Method _loadService must be implemented by subclass');
    }
}

AbstractLoader.propTypes = {
    children: PropTypes.node
};

/**
 * Generates a higher-order component that ensures a service is loaded before
 * displaying passed-in children.
 *
 * @param {Function}
 */
export function generateWrapper(LoaderImpl) {
    return function withLoader(WrappedComponent) {
        return class WithRemoteControl extends React.Component {
            /**
             * Implements React's {@link Component#render()}.
             *
             * @inheritdoc
             * @returns {ReactElement}
             */
            render() {
                return (
                    <LoaderImpl>
                        <WrappedComponent { ...this.props } />
                    </LoaderImpl>
                );
            }
        };
    };
}
