import Action from './Action.js';
import create from './helper/create.js';

/**
 * The helper function used for lazy loading.
 *
 * @param {string} src
 *
 * @returns {Promise<DocumentFragment|null>}
 */
async function load(src) {
    let template;
    // Load the complete HTML from the given source.
    let html = (await (await fetch(src)).text());

    const nodes = create('div');
    // This is a hack to handle relative URLs for scripts. The imports are resolved relative to the current URL but
    // defined relative to the pages src. So the absolute pages directory is used instead of "./".
    let url = (new URL(src.replace(/[^\/]+$/, ''), window.location.href)).toString();
    nodes.innerHTML = html.replace(/src="(..?)\//, `src="${url}$1/`);

    let children = nodes.children;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        // Handle the pages content as well as inline style and scripts.
        if (child instanceof HTMLTemplateElement) {
            template = child;
        } else if (child instanceof HTMLScriptElement) {
            // Create a new script. The browser will not run the code if the original script is used.
            let local = create('script');
            ['type', 'src'].forEach((key) => {
                if (child[key]) {
                    local[key] = child[key];
                }
            });
            // Prepend the pages directory to relative imports with absolute for the same reasons as above.
            local.text = child.text.replace(/(from ['"])(..?)\//, `$1${url}$2/`);
            document.body.appendChild(local);
        } else if (child instanceof HTMLStyleElement) {
            // Style needs to be put to the head by definition.
            document.head.appendChild(child);
        }
    }
    if (!template) {
        return null;
    }
    // The content defined in the pages template will be rendered in DOM.
    return document.importNode(template.content, true);
}

/**
 * A helper function used to run callbacks of the scope from register without checking for existence.
 *
 * @param {{}}     scope
 * @param {string} fun
 */
function call(scope, fun) {
    const callback = scope[fun];
    if (callback) {
        callback();
    }
}

/**
 * Wraps the calls to render and show. This is used when the page shown or registered.
 *
 * @param {{}} scope
 */
function enable(scope) {
    call(scope, 'render');
    call(scope, 'show');
}

/**
 * This class handles the complete page management.
 * This includes lazy loading, rendering of visible pages, browser history and inline code of pages.
 */
export default class Page {
    /**
     * Contains all registered pages with all helpers.
     *
     * @type {{}}
     */
    pages = {};

    /**
     * Creates the page manager. The state is used to dispatch sx-show and sx-hide events. These get the pages ID as
     * payload. The given container is used to hold the visible pages. The current page is always injected as last
     * element. Pages not explicitly hidden are always visible and must be managed by CSS.
     *
     * @param {State}       state
     * @param {HTMLElement} container
     */
    constructor(state, container) {
        this.state = state;
        this.container = container;
        // When a page is shown, the pages ID is added to the browser history.
        window.addEventListener('popstate', (e) => this.show(e.state));
    }

    /**
     * Use this method in your bootstrap code to add available pages. It will be loaded on first use from the given src.
     * The ID is used for show, hide, register and in state events (sx-show, sx-hide) as payload.
     * If a route is given, the browser navigation will be changed to it, when the page is shown. If no routing is
     * needed, pass window.location.href to keep the current url.
     *
     * @param {string} id
     * @param {string} src
     * @param {string} route
     */
    add(id, src, route) {
        this.pages[id] = {src, route};
    }

    /**
     * This shows a page previously added page by injecting it as last element to the container.
     * If the page is requested to be shown for the first time it is lazy loaded.
     * The function triggers the sx-show event on the state manager.
     *
     * @param {string} id
     */
    show(id) {
        let page = this.pages[id];
        if (!page) {
            return;
        }
        if (!page.element) {
            // The page needs a wrapper to ensure one element per page.
            page.element = create('div');
            // Lazy load the pages content.
            load(page.src).then((element) => {
                if (element) {
                    page.element.appendChild(element);
                }
            });
        }
        // There is no need to wait for lazy loading to setup the page.
        this.container.appendChild(page.element);
        // Manage the browser history. Use the ID to be able to react to history events.
        if (history.state && history.state !== id) {
            history.pushState(id, '', page.route);
        } else {
            // If a the initial or active page is shown, no extra history entry is needed.
            history.replaceState(id, '', page.route);
        }
        // Run the callbacks registered by inline code of the page.
        enable(this.pages[id]);
        this.state.dispatch('sx-show', id);
    }

    /**
     * This hides a previously added and showed page completely by removing it from the visible DOM.
     * The function triggers the sx-hide event on the state manager.
     *
     * @param {string} id
     */
    hide(id) {
        const page = this.pages[id];
        if (page && page.element) {
            this.container.removeChild(page.element);
            this.state.dispatch('sx-hide', id);
            // Only modify the history if the removed page is the currently active.
            if (history.state === id) {
                history.go(-1);
            }
        }
    }

    /**
     * Use this function in your pages (inline) code. The the callback documentation below to get more information.
     *
     * @param {string}     id
     * @param {Page~scope} init
     */
    register(id, init) {
        const page = this.pages[id];
        if (!page) {
            return;
        }
        /**
         * Select your required functions from the arguments of this function.
         *
         * @callback Page~scope
         *
         * @param {{render: Page~render, show: Page~show, action: Page~action, listen: Page~listen}}
         */
        init.call(null, {
            /**
             * The render callback is called each time the page needs to be rendered.
             * This happens when the page is requested to be shown and when a callback from listen is triggered.
             *
             * @callback Page~render
             *
             * @param {Function} callback
             */
            render: (callback) => {
                page.render = callback;
            },
            /**
             * The show callback is only called each time the page is requested to be shown.
             * It is always called after render.
             *
             * @callback Page~show
             *
             * @param {Function} callback
             */
            show: (callback) => {
                page.show = callback;
            },
            /**
             * Use this to register local event listeners.
             * These are not able to (accidentally) interact with events from other pages.
             *
             * @callback Page~action
             *
             * @param {string}   selector
             * @param {string}   type
             * @param {Function} callback
             */
            action: (selector, type, callback) => {
                if (!page.action) {
                    // Add a scoped event manager to not bloat the global events listeners.
                    page.action = new Action(page.element);
                }
                page.action.listen(selector, type, callback);
            },
            /**
             * Use this to listen to state events. By using this function you do not need to run render manually.
             *
             * @callback Page~listen
             *
             * @param {string}   key
             * @param {Function} callback
             */
            listen: (key, callback) => {
                this.state.listen(key, (payload) => {
                    callback.call(null, payload);
                    call(page, 'render');
                });
            },
        });
        // Also run enable here because the callbacks are not yet registered when the page is shown for the first time.
        enable(page);
    }
}
