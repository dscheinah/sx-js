import State from 'State.js';
import flushPromises from 'flush-promises';

test('dispatch', async () => {
    const state = new State();

    state.dispatch('test1', 'value');
    expect(state.get('test1')).toEqual('value');

    state.handle('test2', async () => 'value2');
    state.dispatch('test2', 'value');
    await flushPromises();
    expect(state.get('test2')).toEqual('value2');

    state.handle('test3', () => undefined);
    state.dispatch('test3', 'value3');
    expect(state.get('test3')).toEqual('value3');

    state.dispatch('test4', undefined);
    expect(state.get('test4')).toBeNull();

    state.handle('test5', async (x) => x);
    state.handle('test5', async (x, y) => y);
    state.dispatch('test5', 'test');
    await flushPromises();
    expect(state.get('test5')).toEqual('test');
});

test('listen', () => {
    const state = new State();
    let called = 0;
    state.listen('test', payload => payload === 'value' && called++);
    state.listen('test', payload => payload === 'value' && called++);
    state.dispatch('test', 'value');
    expect(called).toEqual(2);
});

test('handle', () => {
    const state = new State();
    let called = 0;
    state.handle('test', (payload, next) => {
        if (payload === 0) {
            called++;
        }
        return next(payload + 1);
    });
    state.handle('test', (payload) => {
        if (payload === 1) {
            called++;
        }
        return 'value';
    });
    state.dispatch('test', 0);
    expect(called).toEqual(2);
    expect(state.get('test')).toEqual('value');
});

test('get', () => {
    const state = new State();

    const payload = {key: 'value'};
    state.set('test', payload);
    const value = state.get('test');
    expect(value).toEqual(payload);
    expect(value).not.toBe(payload);

    state.set('test2', undefined);
    expect(state.get('test2')).toBeNull();
    state.set('test2', false);
    expect(state.get('test2')).toBe(false);
});

test('set', () => {
    const state = new State();
    let called = 0;
    state.listen('test', payload => payload === 'value' && called++);
    state.listen('test', payload => payload === 'value' && called++);
    state.set('test', 'value');
    expect(state.get('test')).toEqual('value');
    expect(called).toEqual(2);
});
