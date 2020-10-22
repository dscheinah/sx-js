/**
 * This is a simple wrapper for document.createElement. By philosophy pages should never use document directly.
 *
 * @param {string} tag
 *
 * @returns {HTMLElement}
 */
export default function create(tag) {
    return document.createElement(tag);
}
