import get from 'helper/get.js';

jest.mock('helper/element.js', () => {
    return (selector) => {
        if (selector === 'valid') {
            return {attribute: true};
        }
        return null;
    };
});

test('get', () => {
    expect(get('valid', 'attribute')).toBeTruthy();
    expect(get('valid', 'any')).toBeFalsy();
    expect(get('invalid', 'attribute')).toBeFalsy();
});
