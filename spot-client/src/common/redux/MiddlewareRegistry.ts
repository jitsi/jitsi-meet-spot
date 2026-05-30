import { Middleware, applyMiddleware } from 'redux';

/**
 * A registry for Redux middleware, allowing features to register their
 * middleware without needing to create additional inter-feature dependencies.
 */
class MiddlewareRegistry {
    private _elements: Middleware[];

    /**
     * Creates a MiddlewareRegistry instance.
     */
    constructor() {
        /**
         * The set of registered middleware.
         *
         * @private
         */
        this._elements = [];
    }

    /**
     * Applies all registered middleware into a store enhancer.
     * (@link http://redux.js.org/docs/api/applyMiddleware.html).
     *
     * @param additional - Any additional middleware that need to
     * be included (such as middleware from third-party modules).
     * @returns
     */
    applyMiddleware(...additional: Middleware[]) {
        return applyMiddleware(...this._elements, ...additional);
    }

    /**
     * Adds a middleware to the registry.
     *
     * The method is to be invoked only before {@link #applyMiddleware()}.
     *
     * @param middleware - A Redux middleware.
     * @returns
     */
    register(middleware: Middleware) {
        this._elements.push(middleware);
    }
}

/**
 * The public singleton instance of the MiddlewareRegistry class.
 */
export default new MiddlewareRegistry();
