/**
 * This class is used for global state management.
 * The state manager only uses a simple name to separate all entries. You must scope your entries manually.
 */
export default class State {
    /**
     * Holds the current global state.
     *
     * @type {{}}
     */
    state = {};

    /**
     * Holds the registered listeners to state changes.
     *
     * @type {{}}
     */
    listeners = {};

    /**
     * Holds the registered handlers that transform events to state values.
     *
     * @type {{}}
     */
    handlers = {};

    /**
     * Dispatch a new event. This will trigger the registered handlers to convert the payload. The converted payload
     * will then be set and forwarded to the registered listeners.
     *
     * @param {string} name
     * @param {*}      payload
     */
    dispatch(name, payload) {
        if (payload === undefined) {
            payload = null;
        }
        let handlers = this.handlers[name] || [];
        // Callback to transform data with handlers. The step is used to create the middleware chain.
        let dispatch = (payload, step) => {
            let handler = handlers[step];
            if (handler) {
                return handler(payload, payload => dispatch(payload, step + 1));
            }
        };
        // Callback to trigger listeners after the handlers are ready.
        let handle = (result) => {
            // If no handler transformed the parameters it is used as is.
            if (result === undefined) {
                result = payload;
            }
            // This implicitly triggers the listeners.
            this.set(name, result);
        };
        let result = dispatch(payload, 0);
        // Handlers may be async but don't need to be.
        if (result instanceof Promise) {
            result.then(result => handle(result));
        } else {
            handle(result);
        }
    }

    /**
     * Listen for state changes triggered by dispatch or set.
     * The current data will be given as a parameter to the callback.
     *
     * @param {string}   name
     * @param {Function} callback
     */
    listen(name, callback) {
        if (!this.listeners[name]) {
            this.listeners[name] = [];
        }
        this.listeners[name].push(callback);
    }

    /**
     * Register a handler. Handlers are used to (asynchronously) transform parameters to state data.
     * A handler gets the payload from dispatch as the first parameter.
     * The second parameter is a next callback. This can be called with (modified) payload to get the result of the next
     * registered handler. With this you can create middleware chains if needed.
     *
     * @param {string}   name
     * @param {Function} callback
     */
    handle(name, callback) {
        if (!this.handlers[name]) {
            this.handlers[name] = [];
        }
        this.handlers[name].push(callback);
    }

    /**
     * Get the current value of the state.
     *
     * @param {string} name
     *
     * @returns {*}
     */
    get(name) {
        // Use clones of the data to not allow implicit state changes.
        return JSON.parse(JSON.stringify(this.state[name]));
    }

    /**
     * Directly sets the current value of the state. This can be used to create the initial state.
     *
     * @param {string} name
     * @param {*}      value
     */
    set(name, value) {
        this.state[name] = value;
        if (this.listeners[name]) {
            this.listeners[name].forEach(callback => callback(this.get(name)));
        }
    }
}
