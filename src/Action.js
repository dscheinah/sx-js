export default class Action {
    listeners = {};

    constructor(base) {
        this.base = base;
    }

    listen(selector, type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = {};
            this.base.addEventListener(type, (event) => {
                const selectors = Object.keys(this.listeners[type]);
                let target = event.target;
                while (target && target.matches) {
                    selectors.forEach((selector) => {
                        if (target.matches(selector)) {
                            this.listeners[type][selector].forEach(callback => callback(event));
                        }
                    });
                    target = target.parentNode;
                }
            });
        }
        if (!this.listeners[type][selector]) {
            this.listeners[type][selector] = [];
        }
        this.listeners[type][selector].push(callback);
    }
}
