import { type Reducer, combineReducers } from 'redux';

type NameReducerMap = Record<string, Reducer<any, any>>;

/**
 * A registry for Redux reducers, allowing features to register themselves
 * without needing to create additional inter-feature dependencies.
 */
class ReducerRegistry {
    private _elements: NameReducerMap;

    /**
     * Creates a ReducerRegistry instance.
     */
    constructor() {
        /**
         * The set of registered reducers, keyed based on the field each reducer
         * will manage.
         *
         * @private
         * @type {NameReducerMap}
         */
        this._elements = {};
    }

    /**
     * Combines all registered reducers into a single reducing function.
     *
     * @param [additional={}] - Any additional reducers that need to be
     * included (such as reducers from third-party modules).
     * @returns
     */
    combineReducers(additional?: NameReducerMap): Reducer {
        return combineReducers({
            ...this._elements,
            ...additional
        });
    }

    /**
     * Adds a reducer to the registry.
     *
     * The method is to be invoked only before {@link #combineReducers()}.
     *
     * @param name - The field in the state object that will be managed
     * by the provided reducer.
     * @param reducer - A Redux reducer.
     * @returns
     */
    register(name: string, reducer: Reducer<any, any>): void {
        this._elements[name] = reducer;
    }
}

/**
 * The public singleton instance of the ReducerRegistry class.
 */
export default new ReducerRegistry();
