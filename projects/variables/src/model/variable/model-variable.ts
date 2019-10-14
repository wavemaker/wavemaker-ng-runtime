import { DataSource, IDataSource, isDefined } from '@wm/core';

import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseVariable } from '../base-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { appManager } from '../../util/variable/variables.utils';
import { BaseList } from '../base-list';
import { BaseObject } from '../base-object';
declare const _;

const getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.MODEL);
};

export class ModelVariable extends BaseVariable implements IDataSource {

    type: any;
    saveInPhonegap: any;
    private baseList;
    private baseObject;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    init() {
        if (this.isList) {
            getManager().removeFirstEmptyObject(this);
        }
        getManager().initBinding(this, 'dataBinding', 'dataSet');
        this.baseList = new BaseList();
        this.baseObject = new BaseObject();
        this.assignProto(this.dataSet);
    }

    assignProto(data: any) {
        // For Array Data type
        if (_.isArray(data)) {
            data.__proto__ = this.baseList;
            if (!_.isEmpty(data)) {
                for (const item of data) {
                    if (typeof item === 'object') {
                        this.assignProto(item);
                    }
                }
            }
            return;
        }

        // for object data type
        if (_.isObject(data)) {
            data.__proto__ = this.baseObject;
            const keysArr = Object.keys(data);
            if (keysArr.length > 0) {
                for (const key of keysArr) {
                    if (typeof data[key] === 'object') {
                        this.assignProto(data[key]);
                    }
                }
            }
            return;
        }

        return; // breaks the function on primitive data type

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
