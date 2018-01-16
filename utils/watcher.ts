import { isObject, debounce, idMaker } from './utils';
import { $parse } from './expression-parser';

const registry = new Map<string, any>();

const idGen = idMaker('watch-id-');

export const $watch = (expr, $scope, $locals, listener, identifier = idGen.next().value) => {
    const fn = $parse(expr);

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
        if (nv !== ov || isObject(nv) || isObject(ov)) {
            changedByWatch = true;
            listener(nv, ov);
            changedByWatch = false;
            watchInfo.last = nv;
        }
    });
};

export const isChangeFromWatch = () => changedByWatch;

(<any>window).watchRegistry = registry;

export const $digest = debounce(triggerWatchers, 100);
