import { CookieConsentResolver } from '../../src/cookie-consent-resolver.mjs';
import { CookieConsentWrapper } from './fixtures/cookie-consent-wrapper.mjs';
import { setConsentCookie, getScriptsSrc } from './helpers.mjs';

describe('Test CookieConsentResolver object', function () {
    beforeEach(() => {
        document.body.innerHTML = '<h1>Test</h1>';
        setConsentCookie(document, null);
    });

    it('Test factory CookieConsentResolver.createFromCookie() - missing cookie', () => {
        const resolver = CookieConsentResolver.createFromCookie('cc-settings', document);

        expect(resolver.categories).toEqual([]);
    });

    it('Test factory CookieConsentResolver.createFromCookie() - existing cookie', () => {
        setConsentCookie(document, {
            categories: ['category_a', 'category_b'],
        });
        const resolver = CookieConsentResolver.createFromCookie('cc-settings', document);

        expect(resolver.categories).toEqual(['category_a', 'category_b']);
    });

    it('Test factory CookieConsentResolver.createFromCookie() - without document argument', () => {
        const resolver = CookieConsentResolver.createFromCookie('cc-settings');

        expect(resolver.categories).toEqual([]);
    });

    it('Test callbacks resolving', () => {
        setConsentCookie(document, {
            categories: ['category_a'],
        });

        const output = [];
        const resolver = CookieConsentResolver.createFromCookie('cc-settings', document);

        // define resolvable callbacks
        resolver.resolve('category_a', () => {
            output.push('1 called');
        });
        resolver.resolve('category_b', () => {
            output.push('2 called');
        });
        resolver.resolve(['category_a', 'category_b'], () => {
            output.push('3 called');
        });
        resolver.resolve(['category_b', 'category_c'], () => {
            output.push('4 called');
        });
        resolver.resolve(['denied_category'], () => {
            output.push('denied category called');
        });

        // "initial" state
        expect(output).toEqual(['1 called']);

        // add "category_b"
        resolver.updateCategories(['category_a', 'category_b']);
        expect(output).toEqual(['1 called', '2 called', '3 called']);

        // add "category_c"
        resolver.updateCategories(['category_a', 'category_b', 'category_c']);
        expect(output).toEqual(['1 called', '2 called', '3 called', '4 called']);

        // define another callbacks
        resolver.resolve(['category_c'], () => {
            output.push('5 called');
        });
        resolver.resolve(['category_d', 'category_e'], () => {
            output.push('6 called');
        });

        // "5 called" exists because "category_c" is already granted
        expect(output).toEqual(['1 called', '2 called', '3 called', '4 called', '5 called']);

        // add "category_d" and "category_e"
        resolver.updateCategories(['category_a', 'category_b', 'category_c', 'category_d', 'category_e']);
        expect(output).toEqual(['1 called', '2 called', '3 called', '4 called', '5 called', '6 called']);

        // reset categories, reassign them and verify that callbacks are not invoked again
        resolver.updateCategories([]);
        resolver.updateCategories(['category_a', 'category_b', 'category_c', 'category_d', 'category_e']);
        expect(output).toEqual(['1 called', '2 called', '3 called', '4 called', '5 called', '6 called']);
    });

    it('Test scripts injecting', () => {
        setConsentCookie(document, {
            categories: ['category_a'],
        });

        const resolver = CookieConsentResolver.createFromCookie('cc-settings', document);

        // define scripts
        resolver.injectScript('category_a', 'https://example.com/script/a');
        resolver.injectScript('category_b', 'https://example.com/script/b');
        resolver.injectScript(['category_a', 'category_b'], 'https://example.com/script/a_b');
        resolver.injectScript(['category_b', 'category_c'], 'https://example.com/script/b_c');
        resolver.injectScript(['denied_category'], 'https://example.com/script/denied');

        // "initial" state
        expect(getScriptsSrc(document)).toEqual([
            'https://example.com/script/a',
        ]);

        // add "category_b"
        resolver.updateCategories(['category_a', 'category_b']);
        expect(getScriptsSrc(document)).toEqual([
            'https://example.com/script/a',
            'https://example.com/script/b',
            'https://example.com/script/a_b',
        ]);

        // add "category_c"
        resolver.updateCategories(['category_a', 'category_b', 'category_c']);
        expect(getScriptsSrc(document)).toEqual([
            'https://example.com/script/a',
            'https://example.com/script/b',
            'https://example.com/script/a_b',
            'https://example.com/script/b_c',
        ]);

        // define another scripts
        resolver.injectScript(['category_c'], 'https://example.com/script/c');
        resolver.injectScript(['category_d', 'category_e'], 'https://example.com/script/d_e');

        // "https://example.com/script/c" exists because "category_c" is already granted
        expect(getScriptsSrc(document)).toEqual([
            'https://example.com/script/a',
            'https://example.com/script/b',
            'https://example.com/script/a_b',
            'https://example.com/script/b_c',
            'https://example.com/script/c',
        ]);

        // add "category_d" and "category_e"
        resolver.updateCategories(['category_a', 'category_b', 'category_c', 'category_d', 'category_e']);
        expect(getScriptsSrc(document)).toEqual([
            'https://example.com/script/a',
            'https://example.com/script/b',
            'https://example.com/script/a_b',
            'https://example.com/script/b_c',
            'https://example.com/script/c',
            'https://example.com/script/d_e',
        ]);

        // reset categories, reassign them and verify that scripts are not injected again
        resolver.updateCategories([]);
        resolver.updateCategories(['category_a', 'category_b', 'category_c', 'category_d', 'category_e']);
        expect(getScriptsSrc(document)).toEqual([
            'https://example.com/script/a',
            'https://example.com/script/b',
            'https://example.com/script/a_b',
            'https://example.com/script/b_c',
            'https://example.com/script/c',
            'https://example.com/script/d_e',
        ]);
    });

    it('Test scripts injecting with attributes', () => {
        setConsentCookie(document, {
            categories: ['category_a', 'category_b'],
        });

        const resolver = CookieConsentResolver.createFromCookie('cc-settings', document);

        resolver.injectScript(['category_a', 'category_b'], 'https://example.com/script/a_b', {
            id: 'my-script',
            async: true,
        });

        const script = document.querySelector('script');

        expect(script).not.toBeNull();
        expect(script.src).toEqual('https://example.com/script/a_b')
        expect(script.id).toEqual('my-script');
        expect(script.async).toBeTruthy();
    });

    it('Test CookieConsentWrapper integration', () => {
        const output = [];
        const wrapper = new CookieConsentWrapper();
        const resolver = CookieConsentResolver.createFromCookie('cc-settings', document);

        resolver.bindCookieConsentWrapper(wrapper);

        expect(wrapper.callbacks['consent:first-action']).toHaveLength(1);
        expect(wrapper.callbacks['consent:changed']).toHaveLength(1);

        resolver.resolve(['category_a'], () => {
            output.push('1 called');
        });

        resolver.resolve(['category_a', 'category_b'], () => {
            output.push('2 called');
        });

        expect(output).toEqual([]);

        wrapper.triggerFirstActionEvent({
            category_a: 'granted',
            category_b: 'denied',
        });

        expect(output).toEqual(['1 called']);

        wrapper.triggerChangedEvent({
            category_a: 'granted',
            category_b: 'granted',
        });

        expect(output).toEqual(['1 called', '2 called']);

        wrapper.triggerChangedEvent({
            category_a: 'denied',
            category_b: 'denied',
        });
        wrapper.triggerChangedEvent({
            category_a: 'granted',
            category_b: 'granted',
        });

        expect(output).toEqual(['1 called', '2 called']);
    });
});
