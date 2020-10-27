import create from 'helper/create.js';

test('create', () => {
   expect(create('div')).toBeInstanceOf(HTMLDivElement);
});
