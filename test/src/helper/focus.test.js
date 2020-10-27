import focus from 'helper/focus.js';
import element from 'helper/element.js';

jest.mock('helper/element.js', () => {
    return jest.fn().mockImplementation((selector) => {
        if (selector === 'valid') {
            return {
                focus() {
                    throw new Error('focused');
                }
            };
        }
        return null;
    });
});

test('focus', () => {
    expect(() => focus('valid')).toThrow('focused');
    focus('invalid');
    expect(element.mock.calls).toContainEqual(['invalid']);
});
