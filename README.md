<h1 align="center">:cookie: Cookie Consent Resolver</h1>

<p align="center">Utility for <a href="https://github.com/68publishers/cookie-consent">68publishers/cookie-consent</a> that allows you to inject scripts without waiting for the cookies widget to load!</p>

<p align="center">
<img src="https://github.com/68publishers/cookie-consent-resolver/actions/workflows/tests.yml/badge.svg?branch=main" alt="Tests">
<img src="https://github.com/68publishers/cookie-consent-resolver/actions/workflows/coding-style.yml/badge.svg?branch=main" alt="Coding style">
</p>

## Why

In some cases, it is desirable to run some scripts as soon as possible, and initializing the cookie widget may slow down the execution of these scripts.
This package allows scripts to be injected into the page immediately if the user has already given consent.

## Installation

The first option is to download the package as a module.

```sh
$ npm i --save @68publishers/cookie-consent-resolver
# or
$ yarn add @68publishers/cookie-consent-resolver
```

And import it in your project.

```js
import CookieConsentResolver from '@68publishers/cookie-consent-resolver';
// or
const CookieConsentResolver = require('@68publishers/cookie-consent-resolver');
```

Or you can import the `CookieConsentResolver` into the browser from the CDN

```html
<script src="https://unpkg.com/@68publishers/cookie-consent-resolver/dist/cookie-consent-resolver.min.js"></script>
```

## Usage

```javascript
var cookieConsentResolver = CookieConsentResolver.createFromCookie('cc-settings');

cookieConsentResolver.bindCookieConsentWrapper(CookieConsentWrapper);

// the following script will be injected if the `ad_storage` is enabled
cookieConsentResolver.injectScript('ad_storage', 'https://www.example.com/my-script.js');

// the following script will be injected if the `ad_storage` and `analytics_storage` are enabled
cookieConsentResolver.injectScript(['ad_storage', 'analytics_storage'], 'https://www.example.com/my-script2.js');
```

Additional `<script>` tag attributes can be provided in the third argument.

```javascript
cookieConsentResolver.injectScript('ad_storage', 'https://www.example.com/my-script.js', {
  id: 'my-script',
  async: true,
});
```

If you want to do anything other than inject the script in case of consent, you can use the `resolve()` method.

```javascript
cookieConsentResolver.resolve('ad_storage', () => {
  console.log('Ad storage is enabled!');
});
```

## License

The package is distributed under the MIT License. See [LICENSE](LICENSE.md) for more information.
