import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';

const  getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LOGIN);
};

export class LoginAction extends BaseAction {

    startUpdate: boolean;
    autoUpdate: boolean;
    useDefaultSuccessHandler: boolean;

    constructor(variable: any) {
        super();
        Object.assign(this, variable);
    }

    login(options, success, error) {
        return getManager().login(this, options, success, error);
    }

    invoke(options, success, error) {
        return this.login(options, success, error);
    }

    cancel() {
        // TODO[VIBHU]: implement http abort logic
    }

    init() {
        getManager().initBinding(this, 'dataBinding', 'dataBinding');
    }
}
