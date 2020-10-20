export default class State {
    state = {};

    listeners = {};

    handlers = {};

    dispatch(name, payload) {
        if (payload === undefined) {
            payload = null;
        }
        let handlers = this.handlers[name] || [];
        let dispatch = (payload, step) => {
            let handler = handlers[step];
            if (handler) {
                return handler(payload, payload => dispatch(payload, step + 1));
            }
        };
        let handle = (result) => {
            if (result === undefined) {
                result = payload;
            }
            this.set(name, result);
        };
        let result = dispatch(payload, 0);
        if (result instanceof Promise) {
            result.then(result => handle(result));
        } else {
            handle(result);
        }
    }

    listen(name, callback) {
        if (!this.listeners[name]) {
            this.listeners[name] = [];
        }
        this.listeners[name].push(callback);
    }

    handle(name, callback) {
        if (!this.handlers[name]) {
            this.handlers[name] = [];
        }
        this.handlers[name].push(callback);
    }

    get(name) {
        return this.state[name];
    }

    set(name, value) {
        this.state[name] = value;
        (this.listeners[name] || []).forEach(callback => callback(JSON.parse(JSON.stringify(value))));
    }
}
