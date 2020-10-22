/**
 * This is a simple wrapper for document.querySelectorAll. By philosophy pages should never use document directly.
 *
 * @param {string} selector
 *
 * @returns {NodeList}
 */
export default function elements(selector) {
    return document.querySelectorAll(selector);
}
