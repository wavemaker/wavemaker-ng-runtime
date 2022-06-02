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
import { isDefined } from "../../util/utils";
import { DataSource } from "../../types/types";
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { ServiceVariableUtils } from '../../util/variable/service-variable.utils';
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.SERVICE);
};
var ServiceVariable = /** @class */ (function (_super) {
    __extends(ServiceVariable, _super);
    function ServiceVariable(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        _this.serviceInfo = variable.serviceInfo;
        _this.httpService = variable.httpClientService;
        return _this;
    }
    ServiceVariable.prototype.execute = function (operation, options) {
        var returnVal = _super.prototype.execute.call(this, operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }
        switch (operation) {
            case DataSource.Operation.IS_API_AWARE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_CRUD:
                returnVal = false;
                break;
            case DataSource.Operation.SUPPORTS_DISTINCT_API:
                returnVal = false;
                break;
            case DataSource.Operation.IS_PAGEABLE:
                // Check for both client and server side pagination existence
                returnVal = this.hasPagination();
                break;
            case DataSource.Operation.IS_SORTABLE:
                returnVal = this.hasPagination() && !this._paginationConfig;
                break;
            case DataSource.Operation.SUPPORTS_SERVER_FILTER:
                returnVal = false;
                break;
            case DataSource.Operation.SET_INPUT:
                returnVal = this.setInput(options);
                break;
            case DataSource.Operation.LIST_RECORDS:
                returnVal = this.invoke(options);
                break;
            case DataSource.Operation.INVOKE:
                returnVal = this.invoke(options);
                break;
            case DataSource.Operation.UPDATE:
                returnVal = this.update(options);
                break;
            case DataSource.Operation.SEARCH_RECORDS:
                returnVal = this.searchRecords(options);
                break;
            case DataSource.Operation.DOWNLOAD:
                returnVal = this.download(options);
                break;
            case DataSource.Operation.GET_PAGING_OPTIONS:
                returnVal = this.pagination;
                break;
            case DataSource.Operation.IS_UPDATE_REQUIRED:
                returnVal = this.isUpdateRequired(options);
                break;
            case DataSource.Operation.IS_BOUND_TO_LOCALE:
                returnVal = false;
                break;
            case DataSource.Operation.CANCEL:
                returnVal = this.cancel(options);
                break;
            case DataSource.Operation.SET_PAGINATION:
                returnVal = this.setPagination(options);
                break;
            default:
                returnVal = {};
                break;
        }
        return returnVal;
    };
    ServiceVariable.prototype.hasPagination = function () {
        return this.controller === VARIABLE_CONSTANTS.CONTROLLER_TYPE.QUERY || !_.isEmpty(this.pagination);
    };
    ServiceVariable.prototype.invoke = function (options, success, error) {
        // return this.invokeVar();
        return getManager().invoke(this, options, success, error);
    };
    ServiceVariable.prototype.update = function (options, success, error) {
        return getManager().invoke(this, options, success, error);
    };
    ServiceVariable.prototype.download = function (options, success, error) {
        return getManager().download(this, options, success, error);
    };
    ServiceVariable.prototype.setInput = function (key, val, options) {
        return getManager().setInput(this, key, val, options);
    };
    ServiceVariable.prototype.searchRecords = function (options, success, error) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            getManager().searchRecords(_this, options, function (response, pagination) {
                resolve({ data: response.content || response, pagination: pagination });
            }, reject);
        });
    };
    ServiceVariable.prototype.isUpdateRequired = function (hasData) {
        var inputFields = getManager().getInputParms(this);
        var queryParams = ServiceVariableUtils.excludePaginationParams(inputFields);
        if (!queryParams.length) {
            // if we don't have any query params and variable data is available then we don't need variable update, so return false
            if (hasData) {
                return false;
            }
        }
        return true;
    };
    ServiceVariable.prototype.setPagination = function (data) {
        return getManager().setPagination(this, data);
    };
    ServiceVariable.prototype.cancel = function (options) {
        return getManager().cancel(this, options);
    };
    ServiceVariable.prototype.init = function () {
        getManager().initBinding(this);
        getManager().defineFirstLastRecord(this);
    };
    return ServiceVariable;
}(ApiAwareVariable));
export { ServiceVariable };
//# sourceMappingURL=service-variable.js.map