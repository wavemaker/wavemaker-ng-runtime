import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseAction } from '../base-action';

export class NavigationAction extends BaseAction {
    operation: string;
    pageName: string;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    invoke() {
        VariableManagerFactory.get(this.category).invoke(this);
    }

    init() {
        // static property bindings
        VariableManagerFactory.get(this.category).initBinding(this, 'dataBinding', 'dataBinding');

        // dynamic property bindings (e.g. page params)
        VariableManagerFactory.get(this.category).initBinding(this, 'dataSet', 'dataSet');
    }
}
