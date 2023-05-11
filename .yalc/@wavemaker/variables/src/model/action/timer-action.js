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
import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
var getManager = function () {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.TIMER);
};
var TimerAction = /** @class */ (function (_super) {
    __extends(TimerAction, _super);
    function TimerAction(variable) {
        var _this = _super.call(this) || this;
        _this.repeating = false;
        _this._isFired = false;
        Object.assign(_this, variable);
        return _this;
    }
    // Backward compatible method
    TimerAction.prototype.fire = function (options, success, error) {
        if (this.repeating) {
            this.currentOptions = options;
            this._isFired = true;
        }
        return getManager().trigger(this, options, success, error);
    };
    TimerAction.prototype.invoke = function (options, success, error) {
        return this.fire(options, success, error);
    };
    TimerAction.prototype.cancel = function () {
        return getManager().cancel(this);
    };
    TimerAction.prototype.mute = function () {
        _super.prototype.mute.call(this);
        if (this.repeating) {
            this.cancel();
        }
    };
    TimerAction.prototype.unmute = function () {
        _super.prototype.unmute.call(this);
        if (this.repeating && this._isFired) {
            this.fire(this.currentOptions, null, null);
        }
    };
    return TimerAction;
}(BaseAction));
export { TimerAction };
//# sourceMappingURL=timer-action.js.map