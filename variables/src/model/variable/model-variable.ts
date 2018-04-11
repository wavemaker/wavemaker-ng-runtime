import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseVariable } from '../base-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { DataSource, IDataSource } from '../../data-source';

export class ModelVariable extends BaseVariable implements IDataSource {

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

    execute(operation) {
        let returnVal;
        switch (operation) {
            case DataSource.Operation.IS_API_AWARE:
                returnVal = false;
                break;
            case DataSource.Operation.SUPPORTS_CRUD:
                returnVal = false;
                break;
            case DataSource.Operation.IS_PAGEABLE:
                returnVal = false;
                break;
            default:
                returnVal = {};
        }
        return returnVal;
    }
}
