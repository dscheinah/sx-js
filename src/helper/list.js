import element from './element.js';

export default function list(selector, data, callback) {
    const list = element(selector);
    if (!list) {
        return;
    }
    const children = Array.from(list.children);
    const length = children.length;
    (data || []).forEach((item, index) => {
        const element = callback(item);
        const child = children[index];
        if (child) {
            if (element.innerHTML !== child.innerHTML) {
                list.replaceChild(element, child);
            }
        } else {
            list.appendChild(element);
        }
    });
    for (let i = data.length; i < length; i++) {
        list.removeChild(children[i]);
    }
}
