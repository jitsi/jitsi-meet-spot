import { logger } from 'common/logger';
import PropTypes from 'prop-types';
import React from 'react';


import { Loading } from './../views';

/**
 * An abstract class with templates for how to ensure a service is loaded
 * for child components to use.
 */
export class AbstractLoader extends React.PureComponent {
    /**
     * Initializes a new {@code ResetState} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     * @param {string} serviceName - The name of the service that will be loaded and which will
     * appear in the logs.
     * @param {boolean} supportsReconnects=false - Whether or not the service to be loaded by
     * the {@code AbstractLoader} subclass supports or is willing to do reconnects.
     */
    constructor(props, serviceName = 'abstract-loader') {
        super(props);

        /**
         * See description in the constructor.
         *
         * @type {string}
         */
        this._serviceName = serviceName;

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
            .then(() => {
                logger.log(`${this._serviceName} loaded`);

                this.setState({ loaded: true });
            }, error => {
                logger.error(`${this._serviceName} failed to load`, { error });
            });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (this.state.loaded) {
            const { children } = this.props;
            const childProps = this._getPropsForChildren();

            return React.Children.map(children, child =>
                React.cloneElement(child, childProps));
        }

        return <Loading />;
    }

    /**
     * Creates props the service should pass into children so the service can
     * be called.
     *
     * @abstract
     * @returns {Object | null}
     */
    _getPropsForChildren() {
        throw new Error('Method _getPropsForChildren must be implemented by subclass');
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

/* eslint-disable react/no-multi-comp */
/**
 * Generates a higher-order component that ensures a service is loaded before
 * displaying passed-in children.
 *
 * @param {Function} LoaderImpl - The concrete implementation of
 * {@code AbstractLoader} which should wrap another component.
 * @returns {Function} A factory function for creating a loader which can
 * wrap another component.
 */
export function generateWrapper(LoaderImpl) {
    return function withLoader(WrappedComponent) {
        return class ComponentWrappedWithService extends React.PureComponent {
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
/* eslint-enable react/no-multi-comp */
