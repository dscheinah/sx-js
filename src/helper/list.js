import element from './element.js';

/**
 * A helper to manager list elements. This transforms the given data to rendered a list of elements.
 * The selector is used to select the list, the children will be injected to. If it does not exist nothing will be done.
 * The callback will be called for each entry of data. It must return an element that can be injected in the list.
 *
 * @param {string}   selector
 * @param {Array}    data
 * @param {Function} callback
 */
export default function list(selector, data, callback) {
    const list = element(selector);
    if (!list) {
        return;
    }
    if (!data) {
        data = [];
    }
    // Build an array to enable array access on the children.
    const children = Array.from(list.children);
    // Remember the initial list length to trigger deletion if needed.
    const length = children.length;
    data.forEach((item, index) => {
        const element = callback(item);
        const child = children[index];
        if (child) {
            // If the child already exists it will only be replaced (and re-rendered) if it changed.
            if (element.innerHTML !== child.innerHTML) {
                list.replaceChild(element, child);
            }
        } else {
            // Append new items.
            list.appendChild(element);
        }
    });
    // Delete all items that are no longer in the target data.
    for (let i = data.length; i < length; i++) {
        list.removeChild(children[i]);
    }
}
