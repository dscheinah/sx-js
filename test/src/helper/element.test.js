import element from 'helper/element.js';

test('element', () => {
   expect(element('.not-existent')).toBeNull();
   expect(element('body')).toBeInstanceOf(HTMLBodyElement);
});
