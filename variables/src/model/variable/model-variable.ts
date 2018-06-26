import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseVariable } from '../base-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { DataSource, IDataSource, isDefined } from '@wm/core';
import { appManager } from '@wm/variables';

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

    execute(operation, options) {
        let returnVal = super.execute(operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }

        switch (operation) {
            case DataSource.Operation.IS_API_AWARE:
                returnVal = false;
                break;
            case DataSource.Operation.SUPPORTS_CRUD:
                returnVal = false;
                break;
            case DataSource.Operation.SUPPORTS_DISTINCT_API:
                returnVal = false;
                break;
            case DataSource.Operation.IS_PAGEABLE:
                returnVal = false;
                break;
            case DataSource.Operation.SUPPORTS_SERVER_FILTER:
                returnVal = false;
                break;
            case DataSource.Operation.IS_BOUND_TO_LOCALE:
                returnVal = this.isBoundToLocale();
                break;
            case DataSource.Operation.GET_DEFAULT_LOCALE:
                returnVal = this.getDefaultLocale();
                break;
            default:
                returnVal = {};
                break;
        }
        return returnVal;
    }

    isBoundToLocale() {
        return this.name === 'supportedLocale';
    }

    getDefaultLocale() {
        return appManager.getSelectedLocale();
    }

}
