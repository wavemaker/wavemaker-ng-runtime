import { isDefined } from '@wm/core';

import { BaseActionManager } from './base-action.manager';
import { initiateCallback } from '../../../src/util/variable/variables.utils';
import { CONSTANTS } from '../../constants/variables.constants';

export class TimerActionManager extends BaseActionManager {
    trigger(variable, options, success, error) {
        if (isDefined(variable._promise) || CONSTANTS.isStudioMode) {
            return;
        }
        const repeatTimer = variable.repeating,
            delay = variable.delay || CONSTANTS.DEFAULT_TIMER_DELAY,
            event = 'onTimerFire',
            // callBackScope = {} || options && options.scope,
            exec = function () {
                initiateCallback(event, variable, {});
            };

        variable._promise = repeatTimer ? setInterval(exec, delay) : setTimeout(function () {
            exec();
            variable._promise = undefined;
        }, delay);

        /*// destroy the timer on scope destruction
        callBackScope.$on('$destroy', function () {
            variable.cancel(variable._promise);
        });*/

        return variable._promise;
    }
}