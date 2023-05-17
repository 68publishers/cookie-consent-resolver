export class CookieConsentResolver {
    #document;
    #documentLoaded;
    #state;

    constructor(categories, document) {
        this.#document = document;
        this.#state = new Proxy({
            categories: categories,
            callbacks: new Proxy([], {
                get: (target, prop) => {
                    if (prop === 'push') {
                        return (...args) => {
                            const result = target[prop](...args);
                            this.#executeCallbacks();

                            return result;
                        };
                    }

                    return target[prop];
                },
            }),
        }, {
            set: (target, property, value) => {
                if ('categories' !== property || !Array.isArray(value)) {
                    return false;
                }

                const oldValue = target[property];
                target[property] = value;

                if (!(value.length === oldValue.length ? value.every(element => !!oldValue.includes(element)) : false)) {
                    this.#executeCallbacks();
                }

                return true;
            },
        });

        if ('loading' === this.#document.readyState) {
            this.#documentLoaded = false;
            this.#document.addEventListener('DOMContentLoaded', () => {
                this.#documentLoaded = true;
                this.#executeCallbacks();
            });
        } else {
            this.#documentLoaded = true;
        }
    }

    static createFromCookie(cookieName, document = undefined) {
        if (undefined === document && 'undefined' !== typeof window) {
            document = window.document;
        }

        let cookie = document.cookie.match(`(^|;)\\s*${cookieName}\\s*=\\s*([^;]+)`);
        cookie = cookie ? cookie.pop() : null;

        if (null !== cookie) {
            try {
                cookie = JSON.parse(cookie)
            } catch(e) {
                try {
                    cookie = JSON.parse(decodeURIComponent(cookie))
                } catch (e) {
                    console.warn(`Unable to parse cookie "${cookieName}".`);

                    cookie = null;
                }
            }
        }

        return new CookieConsentResolver(
            cookie && cookie.categories ? cookie.categories : [],
            document,
        );
    }

    bindCookieConsentWrapper(cookieConsentWrapper) {
        cookieConsentWrapper.on('consent:first-action', this.#updateConsent.bind(this));
        cookieConsentWrapper.on('consent:changed', this.#updateConsent.bind(this));
    }

    get categories() {
        return this.#state.categories;
    }

    updateCategories(categories) {
        this.#state.categories = categories;
    }

    resolve(categories, callback) {
        categories = Array.isArray(categories) ? categories : [categories];
        this.#state.callbacks.push({
            categories: categories,
            callback: callback,
            executed: false,
        });
    }

    injectScript(categories, url, attributes = {}) {
        this.resolve(categories, () => {
            const script = this.#document.createElement('script');
            script.src = url;

            for (let attrName in attributes) {
                script[attrName] = attributes[attrName];
            }

            this.#document.body.appendChild(script);
        });
    }

    #executeCallbacks() {
        if (!this.#documentLoaded) {
            return;
        }

        for (let i in this.#state.callbacks) {
            const callback = this.#state.callbacks[i];

            if (callback.executed || !callback.categories.every(cat => this.#state.categories.includes(cat))) {
                continue;
            }

            callback.executed = true;
            (callback.callback)();
        }
    }

    #updateConsent(consent) {
        const categories = [];

        for (let categoryName in consent) {
            if ('granted' === consent[categoryName]) {
                categories.push(categoryName);
            }
        }

        this.updateCategories(categories);
    }
}
