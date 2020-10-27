import set from 'helper/set.js';
import elements from 'helper/elements.js';

jest.mock('helper/elements.js', () => {
    const elements = [{
        hasAttribute(key) {
            return key === 'attribute';
        },
        removeAttribute(key) {
            this[key] = null;
        },
    }, {
        hasAttribute(key) {
            return key === 'attribute';
        },
        removeAttribute(key) {
            this[key] = null;
        },
    }];
    return jest.fn().mockImplementation((selector) => {
        if (selector === 'valid') {
            return elements;
        }
        return [];
    });
});

const current = elements('valid');

test('set', () => {
    set('valid', 'attribute', 'value');
    current.forEach(element => expect(element.attribute).toEqual('value'));
    set('valid', 'key', 'value2');
    current.forEach(element => expect(element.key).toEqual('value2'));
    set('valid', 'attribute', null);
    current.forEach(element => expect(element.attribute).toBeNull());
    set('valid', 'key', null);
    current.forEach(element => expect(element.key).toBeNull());
    set('valid', 'key', null);
    current.forEach(element => expect(element.key).toBeNull());
    set('valid', 'none', null);
    current.forEach(element => expect(element.none).toBeUndefined());
    set('invalid', 'attribute', 'anything');
    expect(elements.mock.calls).toContainEqual(['invalid']);

});
