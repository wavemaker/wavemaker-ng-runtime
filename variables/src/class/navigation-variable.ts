import { ModelVariable } from './model-variable';
import { VariableManagerFactory } from '../factory/variable-manager.factory';

let manager;
export class NavigationVariable extends ModelVariable {
    operation: string;
    pageName: string;

    constructor(variable: any) {
        super(variable);
        Object.assign(this, variable);
        manager = manager || VariableManagerFactory.get(this.category);
    }

    isAction() {
        return true;
    }

    invoke() {
        manager.invoke(this);
    }

    init() {
        // static property bindings
        manager.initBinding(this, 'dataBinding', 'dataBinding');

        // dynamic property bindings (e.g. page params)
        manager.initBinding(this, 'dataSet', 'dataSet');
    }
}
