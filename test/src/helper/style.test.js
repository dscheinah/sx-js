import style from 'helper/style.js';
import elements from 'helper/elements.js';

jest.mock('helper/elements.js', () => {
    const elements = [{
        style: {},
    }, {
        style: {},
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
    style('valid', 'style', 'value');
    current.forEach(element => expect(element.style.style).toEqual('value'));
    style('valid', 'style', 'value2');
    current.forEach(element => expect(element.style.style).toEqual('value2'));
    style('invalid', 'style', 'value');
    expect(elements.mock.calls).toContainEqual(['invalid']);

});
