export class CookieConsentWrapper {
    constructor() {
        this.callbacks = {
            'consent:first-action': [],
            'consent:changed': [],
        };
    }

    on(event, callback) {
        this.callbacks[event].push(callback);
    }

    triggerFirstActionEvent(consent) {
        for (let i in this.callbacks["consent:first-action"]) {
            const callback = this.callbacks["consent:first-action"][i];

            callback(consent);
        }
    }

    triggerChangedEvent(consent) {
        for (let i in this.callbacks["consent:changed"]) {
            const callback = this.callbacks["consent:changed"][i];

            callback(consent);
        }
    }
}
