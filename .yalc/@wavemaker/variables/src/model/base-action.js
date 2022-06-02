import { DataSource } from "../types/types";
import DatasetUtil from '../util/dataset-util';
import { getTarget, getTargetNodeKey, getTargetObj, setValueToNode } from "../util/variable/variables.utils";
import { getClonedObject } from "../util/utils";
var BaseAction = /** @class */ (function () {
    function BaseAction() {
        this.isMuted = false;
    }
    BaseAction.prototype.execute = function (operation, options) {
        var returnVal;
        switch (operation) {
            case DataSource.Operation.GET_NAME:
                returnVal = this.name;
                break;
            case DataSource.Operation.GET_UNIQUE_IDENTIFIER:
                returnVal = this._id;
                break;
            case DataSource.Operation.GET_CONTEXT_IDENTIFIER:
                returnVal = this._context;
                break;
        }
        return returnVal;
    };
    BaseAction.prototype.invokeOnParamChange = function (obj, newVal, oldVal) {
        var target = obj.target, root = getTarget(this), targetObj = getTargetObj(obj, root, this), targetNodeKey = getTargetNodeKey(target);
        if ((newVal === oldVal && _.isUndefined(newVal)) || (_.isUndefined(newVal) && (!_.isUndefined(oldVal) || !_.isUndefined(targetObj[targetNodeKey])))) {
            return;
        }
        // Skip cloning for blob column
        if (!_.includes(['blob', 'file'], obj.type)) {
            newVal = getClonedObject(newVal);
        }
        setValueToNode(target, obj, root, this, newVal); // cloning newVal to keep the source clean
        return Promise.resolve(this);
    };
    BaseAction.prototype.getData = function () {
        return this.dataSet;
    };
    BaseAction.prototype.setData = function (dataSet) {
        if (DatasetUtil.isValidDataset(dataSet)) {
            this.dataSet = dataSet;
        }
        return this.dataSet;
    };
    BaseAction.prototype.getValue = function (key, index) {
        return DatasetUtil.getValue(this.dataSet, key, index);
    };
    BaseAction.prototype.setValue = function (key, value) {
        return DatasetUtil.setValue(this.dataSet, key, value);
    };
    BaseAction.prototype.getItem = function (index) {
        return DatasetUtil.getItem(this.dataSet, index);
    };
    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    BaseAction.prototype.setItem = function (index, value) {
        return DatasetUtil.setItem(this.dataSet, index, value);
    };
    BaseAction.prototype.addItem = function (value, index) {
        return DatasetUtil.addItem(this.dataSet, value, index);
    };
    BaseAction.prototype.removeItem = function (index, exactMatch) {
        return DatasetUtil.removeItem(this.dataSet, index, exactMatch);
    };
    BaseAction.prototype.clearData = function () {
        this.dataSet = DatasetUtil.getValidDataset();
        return this.dataSet;
    };
    BaseAction.prototype.getCount = function () {
        return DatasetUtil.getCount(this.dataSet);
    };
    BaseAction.prototype.init = function () {
    };
    BaseAction.prototype.mute = function () {
        this.isMuted = true;
    };
    BaseAction.prototype.unmute = function () {
        this.isMuted = false;
    };
    return BaseAction;
}());
export { BaseAction };
//# sourceMappingURL=base-action.js.map