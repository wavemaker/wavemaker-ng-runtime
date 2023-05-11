var NotifyPromise = /** @class */ (function () {
    function NotifyPromise(fn) {
        var notifyQueue = [], notify = function (status) {
            notifyQueue.forEach(function (fn1) {
                fn1(status);
            });
        };
        var cleanUp = function () {
            notifyQueue.length = 0;
        };
        var p1 = new Promise(function (res, rej) {
            fn(res, rej, notify);
        });
        p1.superThen = p1.then.bind(p1);
        p1.then = function (onResolve, onReject, onNotify) {
            p1.superThen(function (response) {
                onResolve(response);
                cleanUp();
            }, function (reason) {
                onReject(reason);
                cleanUp();
            });
            if (onNotify) {
                notifyQueue.push(onNotify);
            }
        };
        return p1;
    }
    return NotifyPromise;
}());
export { NotifyPromise };
// let newPromise = new PromiseWithNotify((resolve, reject, notify) => {
//     setInterval(notify, 1000);
// })
// console.log(newPromise)
// newPromise.then(undefined, undefined, () => console.log(3));
//# sourceMappingURL=notify-promise.js.map