export default class ActionDispatcher {
    constructor() {
        this.handlers = {}
    }

    on = (action, handler) => {
        this.handlers[action] = handler;
        return this;
    }

    off = (action) => {
        delete this.handlers[action]
        return this;
    }

    dispatch(action, payload) {
        if (!this.handlers[action]) {
            ActionDispatcher.defaultHandler(action, payload);
            return;
        }

        this.handlers[action](payload);
    }

    static defaultHandler(action, data) {
        console.warn("no action: '%s' handler registered. use default handler", action, data);
    }
}