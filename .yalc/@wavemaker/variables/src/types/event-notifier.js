var DefaultEventNotifier = /** @class */ (function () {
    function DefaultEventNotifier() {
        this.listeners = {};
    }
    DefaultEventNotifier.prototype.notify = function (event, args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(function (l) {
                l && l.apply(null, args);
            });
        }
    };
    DefaultEventNotifier.prototype.subscribe = function (event, fn) {
        var _this = this;
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(fn);
        return function () {
            var eventListeners = _this.listeners[event];
            var i = eventListeners.findIndex(function (fni) { return fni === fn; });
            eventListeners.splice(i, 1);
        };
    };
    return DefaultEventNotifier;
}());
export { DefaultEventNotifier };
//# sourceMappingURL=event-notifier.js.map