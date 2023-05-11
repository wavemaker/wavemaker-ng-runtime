var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { isDefined, getClonedObject } from "../../util/utils";
import { DataSource } from "../../types/types";
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { debounceVariableCall } from "../../util/variable/variables.utils";
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LIVE);
};
var LiveVariable = /** @class */ (function (_super) {
    __extends(LiveVariable, _super);
    function LiveVariable(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    LiveVariable.prototype.execute = function (operation, options) {
        var returnVal = _super.prototype.execute.call(this, operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }
        switch (operation) {
            case DataSource.Operation.IS_API_AWARE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_CRUD:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_DISTINCT_API:
                returnVal = true;
                break;
            case DataSource.Operation.IS_PAGEABLE:
                returnVal = true;
                break;
            case DataSource.Operation.IS_SORTABLE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_SERVER_FILTER:
                returnVal = true;
                break;
            case DataSource.Operation.GET_OPERATION_TYPE:
                returnVal = this.operation;
                break;
            case DataSource.Operation.GET_RELATED_PRIMARY_KEYS:
                returnVal = this.getRelatedTablePrimaryKeys(options);
                break;
            case DataSource.Operation.GET_ENTITY_NAME:
                returnVal = this.propertiesMap.entityName;
                break;
            case DataSource.Operation.LIST_RECORDS:
                returnVal = this.listRecords(options);
                break;
            case DataSource.Operation.UPDATE_RECORD:
                returnVal = this.updateRecord(options);
                break;
            case DataSource.Operation.INSERT_RECORD:
                returnVal = this.insertRecord(options);
                break;
            case DataSource.Operation.DELETE_RECORD:
                returnVal = this.deleteRecord(options);
                break;
            case DataSource.Operation.INVOKE:
                returnVal = this.invoke(options);
                break;
            case DataSource.Operation.UPDATE:
                returnVal = this.update(options);
                break;
            case DataSource.Operation.GET_RELATED_TABLE_DATA:
                returnVal = this.getRelatedTableData(options.relatedField, options);
                break;
            case DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS:
                returnVal = this.getDistinctDataByFields(options);
                break;
            case DataSource.Operation.GET_AGGREGATED_DATA:
                returnVal = this.getAggregatedData(options);
                break;
            case DataSource.Operation.GET_MATCH_MODE:
                returnVal = this.matchMode;
                break;
            case DataSource.Operation.DOWNLOAD:
                returnVal = this.download(options);
                break;
            case DataSource.Operation.GET_PROPERTIES_MAP:
                returnVal = this.propertiesMap;
                break;
            case DataSource.Operation.GET_PRIMARY_KEY:
                returnVal = this.getPrimaryKey();
                break;
            case DataSource.Operation.GET_BLOB_URL:
                returnVal = "services/" + this.liveSource + "/" + this.type + "/" + options.primaryValue + "/content/" + options.columnName;
                break;
            case DataSource.Operation.GET_OPTIONS:
                returnVal = this._options || {};
                break;
            case DataSource.Operation.SEARCH_RECORDS:
                returnVal = this.searchRecords(options);
                break;
            case DataSource.Operation.GET_REQUEST_PARAMS:
                returnVal = this.getRequestParams(options);
                break;
            case DataSource.Operation.GET_PAGING_OPTIONS:
                returnVal = this.pagination;
                break;
            case DataSource.Operation.IS_UPDATE_REQUIRED:
                returnVal = true;
                break;
            case DataSource.Operation.IS_BOUND_TO_LOCALE:
                returnVal = false;
                break;
            case DataSource.Operation.CANCEL:
                returnVal = false;
                break;
            default:
                returnVal = {};
                break;
        }
        return returnVal;
    };
    LiveVariable.prototype.listRecords = function (options, success, error) {
        return getManager().listRecords(this, options, success, error);
    };
    LiveVariable.prototype.updateRecord = function (options, success, error) {
        return getManager().updateRecord(this, options, success, error);
    };
    LiveVariable.prototype.insertRecord = function (options, success, error) {
        return getManager().insertRecord(this, options, success, error);
    };
    LiveVariable.prototype.deleteRecord = function (options, success, error) {
        return getManager().deleteRecord(this, options, success, error);
    };
    LiveVariable.prototype.setInput = function (key, val, options) {
        return getManager().setInput(this, key, val, options);
    };
    LiveVariable.prototype.setFilter = function (key, val) {
        return getManager().setFilter(this, key, val);
    };
    LiveVariable.prototype.download = function (options, success, error) {
        return getManager().download(this, options, success, error);
    };
    LiveVariable.prototype.invoke = function (options, success, error) {
        switch (this.operation) {
            case 'insert':
                return this.insertRecord(options, success, error);
            case 'update':
                return this.updateRecord(options, success, error);
            case 'delete':
                return this.deleteRecord(options, success, error);
            default:
                return this.listRecords(options, success, error);
        }
    };
    LiveVariable.prototype.getRelatedTablePrimaryKeys = function (columnName) {
        return getManager().getRelatedTablePrimaryKeys(this, columnName);
    };
    LiveVariable.prototype.getRelatedTableData = function (columnName, options, success, error) {
        return getManager().getRelatedTableData(this, columnName, options, success, error);
    };
    LiveVariable.prototype.getDistinctDataByFields = function (options, success, error) {
        return getManager().getDistinctDataByFields(this, options, success, error);
    };
    LiveVariable.prototype.getAggregatedData = function (options, success, error) {
        return getManager().getAggregatedData(this, options, success, error);
    };
    LiveVariable.prototype.getPrimaryKey = function () {
        return getManager().getPrimaryKey(this);
    };
    LiveVariable.prototype.searchRecords = function (options, success, error) {
        return getManager().searchRecords(this, options, success, error);
    };
    LiveVariable.prototype.getRequestParams = function (options) {
        return getManager().prepareRequestParams(options);
    };
    LiveVariable.prototype._downgradeInputData = function (data) {
        return getManager().downgradeFilterExpressionsToInputData(this, data);
    };
    LiveVariable.prototype._upgradeInputData = function (response, data) {
        return getManager().upgradeInputDataToFilterExpressions(this, response, data);
    };
    LiveVariable.prototype.setOrderBy = function (expression) {
        this.orderBy = expression;
        return this.orderBy;
    };
    // legacy method
    LiveVariable.prototype.update = function (options, success, error) {
        return this.invoke(options, success, error);
    };
    LiveVariable.prototype.createRecord = function (options, success, error) {
        return this.insertRecord(options, success, error);
    };
    LiveVariable.prototype.init = function () {
        getManager().initBinding(this, 'dataBinding', this.operation === 'read' ? 'filterFields' : 'inputFields');
        if (this.operation === 'read') {
            getManager().initFilterExpressionBinding(this);
        }
        getManager().defineFirstLastRecord(this);
    };
    LiveVariable.prototype.invokeOnFiltertExpressionChange = function (obj, targetNodeKey, newVal, oldVal) {
        console.log('filter expr changed', newVal, oldVal);
        if ((newVal === oldVal && _.isUndefined(newVal)) || (_.isUndefined(newVal) && !_.isUndefined(oldVal))) {
            return;
        }
        // Skip cloning for blob column
        if (!_.includes(['blob', 'file'], obj.type)) {
            newVal = getClonedObject(newVal);
        }
        // backward compatibility: where we are allowing the user to bind complete object
        if (obj.target === 'dataBinding') {
            // remove the existing databinding element
            this.filterExpressions.rules = [];
            // now add all the returned values
            _.forEach(newVal, function (value, target) {
                this.filterExpressions.rules.push({
                    'target': target,
                    'value': value,
                    'matchMode': obj.matchMode || 'startignorecase',
                    'required': false,
                    'type': ''
                });
            });
        }
        else {
            // setting value to the root node
            obj[targetNodeKey] = newVal;
        }
        if (this.operation === 'read') {
            /* if auto-update set for the variable with read operation only, get its data */
            if (this.autoUpdate && !_.isUndefined(newVal) && _.isFunction(this.update)) {
                debounceVariableCall(this, 'update');
            }
        }
        else {
            /* if auto-update set for the variable with read operation only, get its data */
            if (this.autoUpdate && !_.isUndefined(newVal) && _.isFunction(this[this.operation + 'Record'])) {
                debounceVariableCall(this, this.operation + 'Record');
            }
        }
        // this.invoke();
    };
    LiveVariable.prototype.cancel = function (options) {
        return getManager().cancel(this, options);
    };
    return LiveVariable;
}(ApiAwareVariable));
export { LiveVariable };
//# sourceMappingURL=live-variable.js.map