import elements from './elements.js';

export default function set(selector, key, value) {
    elements(selector).forEach((element) => {
        if (value === null) {
            if (element.hasAttribute(key)) {
                element.removeAttribute(key);
            } else if (element[key]) {
                element[key] = null;
            }
        } else {
            element[key] = value;
        }
    });
}
