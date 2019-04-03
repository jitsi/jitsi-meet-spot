import PropTypes from 'prop-types';
import React from 'react';

import { logger } from 'common/logger';

import { Loading } from './../views';

/**
 * An abstract class with templates for how to ensure a service is loaded
 * for child components to use.
 *
 * @abstract
 * @extends React.PureComponent
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
    constructor(props, serviceName = 'abstract-loader', supportsReconnects = false) {
        super(props);

        /**
         * Whether or not a reconnect attempt is in progress. Used to prevent
         * multiple reconnects from being in flight at the same time.
         *
         * @type {boolean}
         */
        this._isReconnectQueued = false;

        /**
         * See description in the constructor.
         *
         * @type {string}
         */
        this._serviceName = serviceName;

        /**
         * See description in the constructor.
         *
         * @type {boolean}
         */
        this._supportsReconnects = supportsReconnects;

        /**
         * Whether or not the current instance of {@code RemoteControlLoader} is
         * mounted. Used to prevent the various async remote control service
         * connection flows from firing.
         *
         * @type {boolean}
         */
        this._unmounted = false;

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
        this._doLoadService();
    }

    /**
     * Clears any reconnect in progress.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._unmounted = true;

        clearTimeout(this._reconnectTimeout);
    }

    /**
     * Loads the service.
     *
     * @private
     * @returns {void}
     */
    _doLoadService() {
        this._loadService()
            .then(() => {
                logger.log(`${this._serviceName} loaded`);

                this._isReconnectQueued = false;

                this.setState({ loaded: true });
            })
            .catch(error => {
                logger.warn(`${this._serviceName} failed to load`, { error });

                this._isReconnectQueued = false;

                if (this._supportsReconnects) {
                    this._reconnect();
                }
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

    /**
     * Attempts to re-establish a previous connection to the remote control
     * service. Triggers display of a service message while reconnection is in
     * progress.
     *
     * @protected
     * @returns {void}
     */
    _reconnect() {
        if (this._isReconnectQueued) {
            logger.warn(`${this._serviceName} - reconnect called while already reconnecting`);

            return;
        }

        if (this._unmounted) {
            logger.warn(`${this._serviceName} - cancelling reconnect due to unmount`);

            return;
        }

        this._isReconnectQueued = true;
        this.setState({ loaded: false });

        // FIXME re-use jitter function (which doesn't exist yet)
        // wait a little bit to retry to avoid a stampeding herd
        const jitter = Math.floor(Math.random() * 1500) + 500;

        this._stopService()
            .catch(error => {
                logger.error(
                    `${this._serviceName} an error occurred while trying to stop the service`,
                    { error }
                );
            })
            .then(() => {
                this._reconnectTimeout = setTimeout(() => {
                    logger.log(`${this._serviceName} attempting reconnect`);

                    this._doLoadService();
                }, jitter);
            });
    }

    /**
     * Release any resources associated with the underlying service.
     *
     * @returns {Promise<void>}
     * @private
     */
    _stopService() {
        return Promise.resolve();
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
