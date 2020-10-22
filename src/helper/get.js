import element from './element.js';

/**
 * Get the value of an elements attribute. The element is selected by the given selector.
 * If no element is found the function will return null.
 *
 * @param {string} selector
 * @param {string} key
 *
 * @returns {*|null}
 */
export default function get(selector, key) {
    const selected = element(selector);
    if (selected) {
        return selected[key];
    }
    return null;
}
