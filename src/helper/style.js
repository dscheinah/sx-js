import element from './element.js';

export default function style(selector, property, value) {
    const current = element(selector);
    if (current) {
        current.style[property] = value;
    }
}
