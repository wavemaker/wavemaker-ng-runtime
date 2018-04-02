import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseVariable } from '../base-variable';

export class ModelVariable extends BaseVariable {

    type: any;
    isList: boolean;
    saveInPhonegap: any;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    init() {
        VariableManagerFactory.get(this.category).initBinding(this, 'dataBinding', 'dataSet');
    }
}
