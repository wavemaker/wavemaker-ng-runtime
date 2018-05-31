import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';

const  getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.TIMER);
};

export class TimerAction extends BaseAction {
    constructor(variable: any) {
        super();
        Object.assign(this, variable);
    }

    // Backward compatible method
    fire(options, success, error) {
        return getManager().trigger(this, options, success, error);
    }

    invoke(options, success, error) {
        return this.fire(options, success, error);
    }

    cancel() {
        return getManager().cancel(this);
    }
}