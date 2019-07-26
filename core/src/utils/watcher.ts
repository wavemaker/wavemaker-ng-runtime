import { IDGenerator } from './id-generator';

import { $parseExpr } from './expression-parser';

declare const _;

const registry = new Map<string, any>();

const watchIdGenerator = new IDGenerator('watch-id-');

export const FIRST_TIME_WATCH = {};

Object.freeze(FIRST_TIME_WATCH);

export const isFirstTimeChange = v => v === FIRST_TIME_WATCH;

let muted = false;

export const debounce = (fn: Function, wait: number = 50) => {
    let timeout;
    return (...args) => {
        window['__zone_symbol__clearTimeout'](timeout);
        timeout = window['__zone_symbol__setTimeout'](() => fn(...args), wait);
    };
};

export const muteWatchers = () => {
    muted = true;
};

export const unMuteWatchers = () => {
    muted = false;
    triggerWatchers();
};

export const $watch = (expr, $scope, $locals, listener, identifier = watchIdGenerator.nextUid(), doNotClone = false, deepClone = false) => {
    if (expr.indexOf('[$i]') !== -1) {
        expr = expr.replace(/\[\$i]/g, '[0]');
    }
    const fn = $parseExpr(expr);

    registry.set(identifier, {
        fn: fn.bind(expr, $scope, $locals),
        listener,
        expr,
        last: FIRST_TIME_WATCH,
        doNotClone,
        deepClone
    });

    return () => $unwatch(identifier);
};

export const $unwatch = identifier => registry.delete(identifier);

let changedByWatch = false;

const $RAF = window.requestAnimationFrame;

let ngZone;

const triggerWatchers = () => {

    if (muted) {
        return;
    }

    const limit = 5;
    let pass = 1;
    let changeDetected;

    do {
        changeDetected = false;
        registry.forEach(watchInfo => {
            const fn = watchInfo.fn;
            const listener = watchInfo.listener;
            const ov = watchInfo.last;
            let nv;

            try {
                nv = fn();
            } catch (e) {
                console.warn(`error in executing expression: '${watchInfo.expr}'`);
            }

            if (!_.isEqual(nv, ov)) {
                changeDetected = true;
                changedByWatch = true;
                watchInfo.last = nv;

                if (_.isObject(nv) && !watchInfo.doNotClone && nv.__cloneable__ !== false) {
                    watchInfo.last = watchInfo.deepClone ?  _.cloneDeep(nv) : _.clone(nv);
                }
                listener(nv, ov);
                resetChangeFromWatch();
            }
        });
        pass++;

    } while (changeDetected && pass < limit);

    if (changeDetected && pass === limit) {
        console.warn(`Number of watch cycles gone above set limit of: ${limit} `);
    }
};

export const setNgZone = zone => ngZone = zone;

export const setAppRef = appRef => {
    $appDigest = (() => {
        let queued = false;
        return (force?: boolean) => {
            if (force) {
                ngZone.run(() => appRef.tick());
                queued = false;
            } else {
                if (queued) {
                    return;
                } else {
                    queued = true;
                    $RAF(() => {
                        ngZone.run(() => appRef.tick());
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

let skipWatchers;

const debouncedTriggerWatchers = debounce(() => {
    skipWatchers = true;
    ngZone.run(() => triggerWatchers());
}, 100);

export const $invokeWatchers = (force?: boolean) => {
    if (force) {
        triggerWatchers();
    } else {

        if (skipWatchers) {
            skipWatchers = false;
            return;
        }
        debouncedTriggerWatchers();
    }
};

export let $appDigest = (force?: boolean) => {};
