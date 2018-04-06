import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseVariable } from '../base-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';

export class ModelVariable extends BaseVariable {

    type: any;
    saveInPhonegap: any;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    init() {
        VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.MODEL)
            .initBinding(this, 'dataBinding', 'dataSet');
    }
}
