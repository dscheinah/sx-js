import element from './element.js';

export default function get(selector, key) {
    const selected = element(selector);
    if (selected) {
        return selected[key];
    }
}
