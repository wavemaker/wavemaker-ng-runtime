import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';

const  getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LOGIN);
};

export class TimerAction extends BaseAction {
    constructor(variable: any) {
        super();
        Object.assign(this, variable);
    }

    invoke(options, success, error) {
        getManager().trigger(this, options, success, error);
    }
}