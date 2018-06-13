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
        last: undefined
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
        }
    });
};

const $RAF = window.requestAnimationFrame;

export const setAppRef = appRef => {
    $appDigest = (() => {
        let queued = false;
        return () => {
            if (queued) {
                return;
            } else {
                queued = true;
                window['__zone_symbol__requestAnimationFrame'](() => {
                    appRef.tick();
                    queued = false;
                });
            }
        };
    })();
};

export const isChangeFromWatch = () => changedByWatch;
export const resetChangeFromWatch = () => changedByWatch = false;

(<any>window).watchRegistry = registry;

export const $invokeWatchers = debounce(triggerWatchers, 100);

export let $appDigest = () => {};
