import { BaseActionManager } from './base-action.manager';

export class TimerActionManager extends BaseActionManager {
    trigger(variable, options, success, error) {
        console.log('triggering timer in some "time", trust me!!');
    }
}