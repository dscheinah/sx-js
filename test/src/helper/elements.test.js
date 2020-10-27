import elements from 'helper/elements.js';

test('elements', () => {
    expect(elements('.not-existent')).toHaveLength(0);
    expect(elements('body')).toHaveLength(1);
});
