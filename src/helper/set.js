import elements from './elements.js';

/**
 * Sets an attribute or property of all elements selected by the given selector.
 *
 * @param {string} selector
 * @param {string} key
 * @param {*}      value
 */
export default function set(selector, key, value) {
    elements(selector).forEach((element) => {
        if (value === null) {
            if (element.hasAttribute(key)) {
                element.removeAttribute(key);
            } else if (element[key]) {
                element[key] = null;
            }
        } else {
            element[key] = value;
        }
    });
}
