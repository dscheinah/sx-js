import Action from 'Action.js';

test('listen', () => {
    const action = new Action(window);
    let called = 0;
    action.listen('div', 'focus', () => called++);
    action.listen('div', 'click', () => called++);
    action.listen('div', 'click', () => called++);
    action.listen('span', 'click', (e, target) => {
        e.preventDefault();
        if (target) {
            called++;
        }
    });
    const div = document.createElement('div');
    const span = document.createElement('span');
    document.body.appendChild(div);
    div.appendChild(span);
    div.dispatchEvent(new Event('focus', {bubbles: true}));
    expect(called).toEqual(1);
    span.dispatchEvent(new Event('focus', {bubbles: true}));
    expect(called).toEqual(2);
    expect(div.dispatchEvent(new Event('click', {bubbles: true, cancelable: true}))).toBeTruthy();
    expect(called).toEqual(4);
    expect(span.dispatchEvent(new Event('click', {bubbles: true, cancelable: true}))).toBeFalsy();
    expect(called).toEqual(7);
});
