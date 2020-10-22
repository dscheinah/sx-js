/**
 * This is a simple wrapper for document.querySelector. By philosophy pages should never use document directly.
 *
 * @param {string} selector
 *
 * @returns {Element|null}
 */
export default function element(selector) {
    return document.querySelector(selector);
}
