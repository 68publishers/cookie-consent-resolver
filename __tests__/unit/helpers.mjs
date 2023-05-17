export function setConsentCookie(document, cookie) {
    if (null === cookie) {
        document.cookie = `cc-settings=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    } else {
        document.cookie = `cc-settings=${JSON.stringify(cookie)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; SameSite=Lax`;
    }
}

export function getScriptsSrc(document) {
    return Array.from(document.querySelectorAll('script')).map(el => el.src);
}
