import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';

const  getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.NAVIGATION);
};

export class NavigationAction extends BaseAction {
    operation: string;
    pageName: string;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    invoke(options?) {
        getManager().invoke(this, options);
    }

    // legacy method.
    navigate(options?) {
        this.invoke(options);
    }

    init() {
        // static property bindings
        getManager().initBinding(this, 'dataBinding', 'dataBinding');

        // dynamic property bindings (e.g. page params)
        getManager().initBinding(this, 'dataSet', 'dataSet');
    }
}
