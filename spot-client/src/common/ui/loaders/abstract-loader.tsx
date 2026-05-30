import { logger } from 'common/logger';
import React from 'react';


import { Loading } from './../views';

interface IProps {
    children?: any;
}

interface IState {
    loaded: boolean;
}

/**
 * An abstract class with templates for how to ensure a service is loaded
 * for child components to use.
 */
export class AbstractLoader<P extends IProps = IProps, S extends IState = IState>
    extends React.PureComponent<P, S> {
    _serviceName: string;

    /**
     * Initializes a new {@code ResetState} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     * @param serviceName - The name of the service that will be loaded and which will
     * appear in the logs.
     */
    constructor(props: P, serviceName = 'abstract-loader') {
        super(props);

        /**
         * See description in the constructor.
         */
        this._serviceName = serviceName;

        this.state = {
            loaded: false
        } as S;
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

                this.setState({ loaded: true } as Partial<S> as S);
            }, (error: any) => {
                logger.error(`${this._serviceName} failed to load`, { error });
            });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        if (this.state.loaded) {
            const { children } = this.props;
            const childProps = this._getPropsForChildren();

            return React.Children.map(children, (child: any) =>
                React.cloneElement(child, childProps));
        }

        return <Loading />;
    }

    /**
     * Creates props the service should pass into children so the service can
     * be called.
     *
     * @abstract
     */
    _getPropsForChildren(): any {
        throw new Error('Method _getPropsForChildren must be implemented by subclass');
    }

    /**
     * Initializes the application service.
     *
     * @abstract
     */
    _loadService(): Promise<any> {
        throw new Error('Method _loadService must be implemented by subclass');
    }
}

/**
 * Generates a higher-order component that ensures a service is loaded before
 * displaying passed-in children.
 *
 * @param LoaderImpl - The concrete implementation of
 * {@code AbstractLoader} which should wrap another component.
 * @returns A factory function for creating a loader which can
 * wrap another component.
 */
export function generateWrapper(LoaderImpl: React.ComponentType<any>) {
    return function withLoader(WrappedComponent: React.ComponentType<any>) {
        return class ComponentWrappedWithService extends React.PureComponent<any> {
            /**
             * Implements React's {@link Component#render()}.
             *
             * @inheritdoc
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
