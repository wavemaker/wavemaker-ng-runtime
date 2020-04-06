import { IDGenerator } from './id-generator';

import { $parseExpr } from './expression-parser';
import { findValueOf } from './utils';

declare const _;

const registry = new Map<string, any>();

const watchIdGenerator = new IDGenerator('watch-id-');

export const FIRST_TIME_WATCH = {};

Object.freeze(FIRST_TIME_WATCH);

export const isFirstTimeChange = v => v === FIRST_TIME_WATCH;

let muted = false;
let appRef;

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

const arrayConsumer = (listenerFn, restExpr, newVal, oldVal) => {
    let data = newVal,
        formattedData;

    if (_.isArray(data)) {
        formattedData = data.map(function (datum) {
            return findValueOf(datum, restExpr);
        });

        // If resulting structure is an array of array, flatten it
        if (_.isArray(formattedData[0])) {
            formattedData = _.flatten(formattedData);
        }

        listenerFn(formattedData, oldVal);
    }
};

const getUpdatedWatcInfo = (expr, acceptsArray, listener) => {
    // listener doesn't accept array
    // replace all `[$i]` with `[0]` and return the expression
    let regex = /\[\$i\]/g,
        $I                = '[$i]',
        $0                = '[0]';
    if (!acceptsArray) {
        return {
            'expr'     : expr.replace(regex, $0),
            'listener' : listener
        };
    }

    // listener accepts array
    // replace all except the last `[$i]` with `[0]` and return the expression.
    var index           = expr.lastIndexOf($I),
        _expr           = expr.substr(0, index).replace($I, $0),
        restExpr        = expr.substr(index + 5),
        arrayConsumerFn = listener;

    if (restExpr) {
        arrayConsumerFn = arrayConsumer.bind(undefined, listener, restExpr);
    }

    return {
        'expr'     : _expr,
        'listener' : arrayConsumerFn
    };
};

export const $watch = (expr, $scope, $locals, listener, identifier = watchIdGenerator.nextUid(), doNotClone = false, config:any={}) => {
    if (expr.indexOf('[$i]') !== -1) {
        let watchInfo = getUpdatedWatcInfo(expr, config && config.arrayType, listener);
        expr = watchInfo.expr;
        listener = watchInfo.listener;
    }
    const fn = $parseExpr(expr);

    registry.set(identifier, {
        fn: fn.bind(expr, $scope, $locals),
        listener,
        expr,
        last: FIRST_TIME_WATCH,
        doNotClone
    });

    return () => $unwatch(identifier);
};

export const $unwatch = identifier => registry.delete(identifier);

let changedByWatch = false;

const $RAF = window.requestAnimationFrame;

let ngZone;

const triggerWatchers = (ignoreMuted?: boolean) => {

    if (muted && !ignoreMuted) {
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
                    watchInfo.last = _.clone(nv);
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

export const setAppRef = ref => {
    appRef = ref
};

export const isChangeFromWatch = () => changedByWatch;
export const resetChangeFromWatch = () => changedByWatch = false;

(<any>window).watchRegistry = registry;

let skipWatchers;

const debouncedTriggerWatchers = debounce(() => {
    skipWatchers = true;
    ngZone.run(() => triggerWatchers());
}, 100);

export const $invokeWatchers = (force?: boolean, ignoreMuted?: boolean) => {
    if (force) {
        triggerWatchers(ignoreMuted);
    } else {

        if (skipWatchers) {
            skipWatchers = false;
            return;
        }
        debouncedTriggerWatchers();
    }
};

export const $appDigest = (() => {
    let queued = false;
    return (force?: boolean) => {
        if (!appRef) {
            return;
        }
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
