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
import { BaseVariableManager } from './base-variable.manager';
var checkEmptyObject = function (obj) {
    var isEmpty = true;
    _.forEach(obj, function (value) {
        if (_.isEmpty(value) && !_.isBoolean(value) && !_.isNumber(value)) {
            return;
        }
        if (!_.isObject(value)) {
            isEmpty = false;
        }
        else if (_.isArray(value)) {
            // If array, check if array is empty or if it has only one value and the value is empty
            isEmpty = _.isEmpty(value) || (value.length === 1 ? _.isEmpty(value[0]) : false);
        }
        else {
            // If object, loop over the object to check if it is empty or not
            isEmpty = checkEmptyObject(value);
        }
        return isEmpty; // isEmpty false will break the loop
    });
    return isEmpty;
};
var ModelVariableManager = /** @class */ (function (_super) {
    __extends(ModelVariableManager, _super);
    function ModelVariableManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /*
    * Case: a LIST type static variable having only one object
    * and the object has all fields empty, remove that object
    */
    ModelVariableManager.prototype.removeFirstEmptyObject = function (variable) {
        if (_.isArray(variable.dataSet) && variable.dataSet.length === 1 && checkEmptyObject(variable.dataSet[0])) {
            variable.dataSet = [];
        }
    };
    return ModelVariableManager;
}(BaseVariableManager));
export { ModelVariableManager };
//# sourceMappingURL=model-variable.manager.js.map