import Page from 'Page.js';
import State from 'State.js';
import flushPromises from 'flush-promises';

const load = document.createElement('div');
const show = document.createElement('div');
const hide = document.createElement('div');
document.body.append(load, show, hide);

global.fetch = jest.fn().mockImplementation((url) => {
    return {
        text() {
            if (url === 'load.html') {
                return `
                    <template><p>Test</p></template>
                    <script src="../"></script>
                    <script>const test = "from '../assets/test.js"</script>
                    <style data-test></style>
                `;
            }
            if (url === 'load/span.html') {
                return '<span></span>';
            }
            return `<template>${url}</template>`
        }
    }
});

test('load', async () => {
    const page = new Page(new State(), load);
    page.add('load', 'load.html', '');
    page.add('span', 'load/span.html', '');

    page.show('load');
    await flushPromises();
    expect(document.querySelector('p').innerHTML).toEqual('Test');
    expect(document.querySelector('script[src]').src).toEqual('http://localhost/');
    expect(document.querySelector('script:not([src])').text).toContain('http://localhost');
    expect(document.querySelector('style[data-test]')).toBeTruthy();

    page.show('span');
    await flushPromises();
    expect(document.querySelector('span')).toBeFalsy();
});

test('show', async () => {
    const state = new State();
    const page = new Page(state, show);
    page.add('test', 'pages/test.html', 'test.html');
    page.add('test2', 'pages/test2.html', 'test2.html');

    page.show('test');
    await flushPromises();
    expect(show.children[0].innerHTML).toEqual('pages/test.html');
    expect(history.state).toEqual('test');
    expect(window.location.href).toEqual('http://localhost/test.html');
    page.show('test2');
    await flushPromises();
    expect(show.children[1].innerHTML).toEqual('pages/test2.html');
    expect(history.state).toEqual('test2');
    expect(window.location.href).toEqual('http://localhost/test2.html');
    page.show('test');
    expect(show.children[1].innerHTML).toEqual('pages/test.html');
    expect(history.state).toEqual('test');
    page.show('page');
    await flushPromises();
    expect(show.children[1].innerHTML).toEqual('pages/test.html');
    expect(history.state).toEqual('test');
});

test('hide', async () => {
    const state = new State();
    const page = new Page(state, hide);
    page.add('test', 'pages/test.html', '');
    page.add('test2', 'pages/test2.html', '');
    page.show('test');
    page.show('test2');
    await flushPromises();

    page.hide('test');
    expect(hide.children.length).toEqual(1);
    expect(history.state).toEqual('test2');
    page.hide('page');
    expect(hide.children.length).toEqual(1);
    expect(history.state).toEqual('test2');
    page.hide('test2');
    expect(hide.children.length).toEqual(0);
});

test('register', async () => {
    const state = new State();
    const page = new Page(state, document.body);
    page.add('test1', 'pages/test.html', '');
    page.add('test2', 'pages/test.html', '');
    page.add('test3', 'pages/test.html', '');
    page.add('test4', 'pages/test.html', '');

    let rendered = 0;
    page.register('test1', ({render}) => {
        render(() => rendered++);
    });
    expect(rendered).toEqual(1);
    page.show('test1');
    expect(rendered).toEqual(2);

    let showed = 0;
    page.register('test2', ({show}) => {
        show(() => showed++);
    });
    expect(showed).toEqual(1);
    page.show('test2');
    expect(showed).toEqual(2);

    let actioned = 0;
    page.show('test3');
    page.register('test3', ({action}) => {
        action('div', 'click', () => actioned++);
        action('void', 'none', () => {});
    });
    page.pages['test3'].element.dispatchEvent(new Event('click'));
    expect(actioned).toEqual(1);

    let listened = 0;
    page.register('test4', ({render, listen}) => {
        render(() => listened++);
        listen('test', () => listened++);
    });
    state.dispatch('test', null);
    expect(listened).toEqual(3);

    page.register('page', () => {
        expect(false).toBeTruthy();
    });
});

test('popstate', async () => {
    const page = new Page(new State(), document.body);
    page.add('test', 'pages/first.html', '');
    page.add('test2', 'pages/second.html', '');
    page.show('test');
    page.show('test2');
    await flushPromises();

    window.dispatchEvent(new PopStateEvent('popstate', {state: 'test'}));
    expect(history.state).toEqual('test');
    expect(document.querySelector('body > :last-child').innerHTML).toEqual('pages/first.html');
});
