import element from './element.js';

export default function focus(selector) {
    const current = element(selector);
    if (current) {
        current.focus();
    }
}
