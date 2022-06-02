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
import { DataSource } from '../../types/types';
import { isDefined } from "../../util/utils";
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseVariable } from '../base-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { appManager } from '../../util/variable/variables.utils';
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.MODEL);
};
var ModelVariable = /** @class */ (function (_super) {
    __extends(ModelVariable, _super);
    function ModelVariable(variable) {
        var _this = _super.call(this) || this;
        Object.assign(_this, variable);
        return _this;
    }
    ModelVariable.prototype.init = function () {
        if (this.isList) {
            getManager().removeFirstEmptyObject(this);
        }
        getManager().initBinding(this, 'dataBinding', 'dataSet');
    };
    ModelVariable.prototype.execute = function (operation, options) {
        var returnVal = _super.prototype.execute.call(this, operation, options);
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
            case DataSource.Operation.IS_SORTABLE:
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
    };
    ModelVariable.prototype.isBoundToLocale = function () {
        return this.name === 'supportedLocale';
    };
    ModelVariable.prototype.getDefaultLocale = function () {
        return appManager.getSelectedLocale();
    };
    return ModelVariable;
}(BaseVariable));
export { ModelVariable };
//# sourceMappingURL=model-variable.js.map