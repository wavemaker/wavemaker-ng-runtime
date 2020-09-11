export class NotifyPromise {

    constructor(fn) {
        const notifyQueue = [],
            notify = status => {
            notifyQueue.forEach(fn1 => {
                fn1(status);
            });
        };

        const cleanUp = function() {
            notifyQueue.length = 0;
        };

        const p1 =  new Promise((res, rej) => {
            fn(res, rej, notify);
        });

        (p1 as any).superThen = p1.then.bind(p1);
        (p1 as any).then = (onResolve, onReject, onNotify) => {
            (p1 as any).superThen(
                response => {
                    onResolve(response);
                    cleanUp();
                },
                reason => {
                    onReject(reason);
                    cleanUp();
                }
            );
            if (onNotify) {
                notifyQueue.push(onNotify);
            }
        };
        return p1;
    }
}

// let newPromise = new PromiseWithNotify((resolve, reject, notify) => {
//     setInterval(notify, 1000);
// })
// console.log(newPromise)
// newPromise.then(undefined, undefined, () => console.log(3));
