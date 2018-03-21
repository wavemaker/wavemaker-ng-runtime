declare const _;

import { triggerFn } from '@utils/utils';

const variableActive = new Map(),
    inFlightQueue = new Map();

/**
 * this function checks if the passed variable is already inFlight
 * If it is:
 *  fnExists callback is executed
 *  NOTE: the push method should be called inside this method to push the calls into the queue
 * if not:
 *  the active flag against that variable is set.
 *  and the fnNotExists callback is executed
 * @param variable
 * @param fnExists
 * @param fnNotExists
 */
const has = (variable, fnExists, fnNotExists) => {
    if (variableActive.has(variable)) {
        fnExists();
    } else {
        variableActive.set(variable, true);
        fnNotExists();
    }
};

/**
 * clears the maps against a variable
 * @param variable
 */
const clear = (variable) => {
    inFlightQueue.delete(variable);
    variableActive.delete(variable);
};

/**
 * marks the active flag in the map against the variable
 * if it is set, the variable is inFlight
 * @param variable
 * @param state
 */
const toggleState = (variable, state) => {
    if (state) {
        variableActive.set(variable, state);
    } else {
        variableActive.delete(variable);
    }
};

/**
 * Trigger error handler before discarding queued requests
 * @param requestQueue
 */
const triggerError = (requestQueue) => {
    _.forEach(requestQueue, function (requestObj) {
        triggerFn(requestObj && requestObj.error);
    });
};

/**
 * executes the n/w calls for a specified variable pushed in its respective queue (pushed while it was inFlight)
 * @param variable
 * @param handler
 * @param options
 */
const process = (variable, handler, options?) => {
    const requestQueue = inFlightQueue.get(variable);
    // process request queue for the variable only if it is not empty
    if (!requestQueue || !requestQueue.length) {
        clear(variable);
        return;
    }
    toggleState(variable, false);
    const inFlightBehavior = _.get(options, 'inFlightBehavior') || variable.inFlightBehavior;
    let requestObj;

    switch (inFlightBehavior) {
        case 'executeLast':
            requestObj = requestQueue.pop();
            triggerError(requestQueue);
            handler(requestObj.variable, requestObj.options, requestObj.success, requestObj.error);
            clear(variable);
            break;
        case 'executeAll':
            requestObj = requestQueue.splice(0, 1).pop();
            handler(requestObj.variable, requestObj.options, requestObj.success, requestObj.error);
            break;
        default:
            triggerError(requestQueue);
            clear(variable);
            break;
    }
};

/**
 * pushes the n/w call config in the queue against the variable
 * The config should contain
 *  - options, expected config options in the handler callback
 *  - success, callback
 *  - error, callback
 * @param variable
 * @param config
 */
const push = (variable, config) => {
    if (!inFlightQueue.has(variable)) {
        inFlightQueue.set(variable, []);
    }
    config.variable = variable;
    inFlightQueue.get(variable).push(config);
};

export const $queue = {
    has: has,
    push: push,
    process: process
};
