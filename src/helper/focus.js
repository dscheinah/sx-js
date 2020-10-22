import element from './element.js';

/**
 * This wrapper focuses the element targeted by the given selector.
 * If no element is found, no focus will be done.
 *
 * @param {string} selector
 */
export default function focus(selector) {
    const current = element(selector);
    if (current) {
        current.focus();
    }
}
