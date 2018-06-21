import { IDGenerator } from './id-generator';

import { debounce } from './utils';
import { $parseExpr } from './expression-parser';

declare const _;

const registry = new Map<string, any>();

const watchIdGenerator = new IDGenerator('watch-id-');

export const $watch = (expr, $scope, $locals, listener, identifier = watchIdGenerator.nextUid()) => {
    const fn = $parseExpr(expr);

    registry.set(identifier, {
        fn: fn.bind(expr, $scope, $locals),
        listener,
        last: undefined,
        expr: expr
    });

    return () => $unwatch(identifier);
};

export const $unwatch = identifier => registry.delete(identifier);

let changedByWatch = false;

const triggerWatchers = () => {
    registry.forEach(watchInfo => {
        const fn = watchInfo.fn;
        const listener = watchInfo.listener;
        const ov = watchInfo.last;
        const nv = fn();
        if (!_.isEqual(nv, ov)) {
            changedByWatch = true;
            listener(nv, ov);
            resetChangeFromWatch();
            watchInfo.last = nv;

            if (_.isObject(nv) && !(nv.proxy || nv instanceof Proxy)) {
                watchInfo.last = _.clone(nv);
            }
        }
    });
};

const $RAF = window.requestAnimationFrame;

export const setAppRef = appRef => {
    $appDigest = (() => {
        let queued = false;
        return (force?: boolean) => {
            if (force) {
                appRef.tick();
                queued = false;
            } else {
                if (queued) {
                    return;
                } else {
                    queued = true;
                    $RAF(() => {
                        appRef.tick();
                        queued = false;
                    });
                }
            }
        };
    })();
};

export const isChangeFromWatch = () => changedByWatch;
export const resetChangeFromWatch = () => changedByWatch = false;

(<any>window).watchRegistry = registry;

const debouncedTriggerWatchers = debounce(triggerWatchers, 100);
export const $invokeWatchers = (force?: boolean) => {
    if (force) {
        triggerWatchers();
    } else {
        debouncedTriggerWatchers();
    }
};

export let $appDigest = (force?: boolean) => {};
