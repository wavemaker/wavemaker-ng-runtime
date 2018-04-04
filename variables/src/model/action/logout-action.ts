import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';

const  getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LOGIN);
};

export class LogoutAction extends BaseAction {

    startUpdate: boolean;
    autoUpdate: boolean;
    useDefaultSuccessHandler: boolean;

    constructor(variable: any) {
        super();
        Object.assign(this, variable);
    }

    logout(options, success, error){
        getManager().logout(this, options, success, error);
    }

    invoke(options, success, error){
        this.logout(options, success, error);
    }

    cancel() {
        // TODO[VIBHU]: implement http abort logic
    }
}