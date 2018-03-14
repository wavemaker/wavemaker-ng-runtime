import { debounce, idMaker } from './utils';
import { $parseExpr } from './expression-parser';

declare const _;

const registry = new Map<string, any>();

const idGen = idMaker('watch-id-');

export const $watch = (expr, $scope, $locals, listener, identifier = idGen.next().value) => {
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
            changedByWatch = false;
            watchInfo.last = nv;
        }
    });
};

export const setAppRef = appRef => {
    $appDigest = debounce(appRef.tick.bind(appRef), 100);
};

export const isChangeFromWatch = () => changedByWatch;

(<any>window).watchRegistry = registry;

export const $invokeWatchers = debounce(triggerWatchers, 100);

export let $appDigest = () => {};
