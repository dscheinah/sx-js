/**
 * This class defines the global event management. Use it to addEventListeners to elements or the window.
 */
export default class Action {
    /**
     * This is the list of registered listeners.
     *
     * @type {{}}
     */
    listeners = {};

    /**
     * Creates the event listener abstraction for the given element.
     *
     * @param {EventTarget} base
     */
    constructor(base) {
        this.base = base;
    }

    /**
     * Listen for an event of the given type.
     * The callback is only run if the event target (including the parents) matches the given CSS selector.
     *
     * @param {string}   selector
     * @param {string}   type
     * @param {Function} callback
     */
    listen(selector, type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = {};
            // Only register one listener per type to keep the event dispatching clean.
            this.base.addEventListener(type, (event) => {
                const selectors = Object.keys(this.listeners[type]);
                // Check the target and all parents for all selectors.
                let target = event.target;
                // If the target does not have the matches function it already is the document.
                while (target && target.matches) {
                    selectors.forEach((selector) => {
                        if (target.matches(selector)) {
                            // Run all registered callbacks if the selector is matched.
                            this.listeners[type][selector].forEach(callback => callback(event, target));
                        }
                    });
                    target = target.parentNode;
                }
            });
        }
        // Collect all selectors and callbacks to be used in the event listener above.
        if (!this.listeners[type][selector]) {
            this.listeners[type][selector] = [];
        }
        this.listeners[type][selector].push(callback);
    }
}
