import list from 'helper/list.js';
import element from 'helper/element.js';

jest.mock('helper/element.js', () => {
    const element = {
        children: [],
        replaceChild(newChild, oldChild) {
            let index = this.children.indexOf(oldChild);
            this.children[index] = newChild;
        },
        appendChild(child) {
            this.children.push(child);
        },
        removeChild(child) {
            this.children = this.children.filter(test => test === child);
        },
    };
    return jest.fn().mockImplementation((selector) => {
        if (selector === 'valid') {
            return element;
        }
        return null;
    });
});

const callback = (value) => {
    let div = document.createElement('div');
    div.innerHTML = value;
    return div;
};

const valid = element('valid');

test('list', () => {
    list('valid', [1, 2], callback);
    expect(valid.children).toHaveLength(2);
    list('valid', [1, 2], callback);
    expect(valid.children).toHaveLength(2);
    list('valid', [1, 3], callback);
    expect(valid.children).toHaveLength(2);
    expect(valid.children[1].innerHTML).toEqual("3");
    list('valid', [1, 2, 3], callback);
    expect(valid.children).toHaveLength(3);
    expect(valid.children[0].innerHTML).toEqual("1");
    expect(valid.children[1].innerHTML).toEqual("2");
    expect(valid.children[2].innerHTML).toEqual("3");
    list('valid', null, callback);
    expect(valid.children).toHaveLength(0);
    list('invalid', [], callback);
    expect(element.mock.calls).toContainEqual(['invalid']);
});
