import elements from './elements.js';

/**
 * Sets one of the style properties of all elements selected by the given selector.
 *
 * @param {string} selector
 * @param {string} property
 * @param {string} value
 */
export default function style(selector, property, value) {
    elements(selector).forEach((element) => {
        element.style[property] = value;
    });
}
