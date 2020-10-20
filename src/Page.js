import Action from './Action.js';
import create from './helper/create.js';

async function load(src) {
    let template;

    let url = new URL(src.replace(/[^\/]+$/, ''), window.location.href);
    let html = (await (await fetch(src)).text());

    const nodes = create('div');
    nodes.innerHTML = html.replace('src="./', `src="${url.toString()}`);

    let children = nodes.children;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (child instanceof HTMLTemplateElement) {
            template = child;
        } else if (child instanceof HTMLScriptElement) {
            if (child.src) {
                child.text = await (await fetch(child.src)).text();
            }
            let local = create('script');
            local.type = child.type;
            local.text = child.text.replace(/(['"])..\//, '$1./');
            document.body.appendChild(local);
        } else if (child instanceof HTMLStyleElement) {
            document.head.appendChild(child);
        }
    }

    return document.importNode(template.content, true);
}

function call(scope, fun) {
    const callback = (scope || {})[fun];
    if (callback) {
        callback();
    }
}

function enable(scope) {
    call(scope, 'render');
    call(scope, 'show');
}

export default class Page {
    pages = {};

    constructor(state, element) {
        this.state = state;
        this.element = element;
        window.addEventListener('popstate', (e) => this.show(e.state));
    }

    add(id, src, route) {
        this.pages[id] = {src, route};
    }

    show(id) {
        let page = this.pages[id];
        if (!page) {
            return;
        }
        if (!page.element) {
            page.element = create('div');
            load(page.src).then((element) => {
                page.element.appendChild(element);
            });
        }
        this.element.appendChild(page.element);

        if (history.state && history.state !== id) {
            history.pushState(id, '', page.route);
        } else {
            history.replaceState(id, '', page.route);
        }

        enable(this.pages[id]);
        this.state.dispatch('sx-show', id);
    }

    hide(id) {
        const page = this.pages[id];
        if (page && page.element) {
            this.element.removeChild(page.element);
            this.state.dispatch('sx-hide', id);
            if (history.state === id) {
                history.go(-1);
            }
        }
    }

    register(id, init) {
        const page = this.pages[id];
        if (!page) {
            return;
        }
        init.call(null, {
            render: (callback) => {
                page.render = callback;
            },
            show: (callback) => {
                page.show = callback;
            },
            action: (selector, type, callback) => {
                if (!page.action) {
                    page.action = new Action(page.element);
                }
                page.action.listen(selector, type, callback);
            },
            listen: (key, callback) => {
                this.state.listen(key, (payload) => {
                    callback.call(null, payload);
                    call(page, 'render');
                });
            },
        });
        enable(page);
    }
}
