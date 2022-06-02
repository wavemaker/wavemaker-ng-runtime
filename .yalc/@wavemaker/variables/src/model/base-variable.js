import { DataSource } from '../types/types';
import DatasetUtil from '../util/dataset-util';
import { getTargetNodeKey, getTargetObj, getTarget, setValueToNode, internalBoundNodeMap, updateInternalNodes } from "../util/variable/variables.utils";
import { getClonedObject } from "../util/utils";
import { DefaultEventNotifier } from "../types/event-notifier";
export var VariableEvents;
(function (VariableEvents) {
    VariableEvents["BEFORE_INVOKE"] = "beforeInvoke";
    VariableEvents["AFTER_INVOKE"] = "afterInvoke";
})(VariableEvents || (VariableEvents = {}));
;
var BaseVariable = /** @class */ (function () {
    function BaseVariable() {
        this.isMuted = false;
        this.eventNotifier = new DefaultEventNotifier();
    }
    BaseVariable.prototype.notify = function (event, args) {
        this.eventNotifier.notify(event, args);
    };
    BaseVariable.prototype.subscribe = function (event, fn) {
        return this.eventNotifier.subscribe(event, fn);
    };
    BaseVariable.prototype.execute = function (operation, options) {
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
            case DataSource.Operation.ADD_ITEM:
                returnVal = this.addItem(options.item, _.omit(options, 'item'));
                break;
            case DataSource.Operation.SET_ITEM:
                returnVal = this.setItem(options.prevItem, options.item, _.omit(options, 'prevItem', 'item'));
                break;
            case DataSource.Operation.REMOVE_ITEM:
                returnVal = this.removeItem(options.item, _.omit(options, 'item'));
                break;
        }
        return returnVal;
    };
    BaseVariable.prototype.invokeOnParamChange = function (obj, newVal, oldVal) {
        var runMode = true;
        if (!obj) {
            return;
        }
        var target = obj === null || obj === void 0 ? void 0 : obj.target, root = getTarget(this), targetObj = getTargetObj(obj, root, this), targetNodeKey = getTargetNodeKey(target);
        if ((newVal === oldVal && _.isUndefined(newVal)) || (_.isUndefined(newVal) && (!_.isUndefined(oldVal) || !_.isUndefined(targetObj[targetNodeKey])))) {
            return;
        }
        // Skip cloning for blob column
        if (!_.includes(['blob', 'file'], obj.type)) {
            newVal = getClonedObject(newVal);
        }
        setValueToNode(target, obj, root, this, newVal); // cloning newVal to keep the source clean
        if (runMode) {
            /*set the internal bound node map with the latest updated value*/
            if (!internalBoundNodeMap.has(this)) {
                internalBoundNodeMap.set(this, {});
            }
            _.set(internalBoundNodeMap.get(this), [this.name, root, target], newVal);
            /*update the internal nodes after internal node map is set*/
            if (_.isObject(newVal)) {
                updateInternalNodes(target, root, this);
            }
        }
        return Promise.resolve(this);
    };
    BaseVariable.prototype.getData = function () {
        return this.dataSet;
    };
    BaseVariable.prototype.setData = function (dataSet) {
        if (DatasetUtil.isValidDataset(dataSet, this.isList)) {
            this.dataSet = dataSet;
        }
        return this.dataSet;
    };
    BaseVariable.prototype.getValue = function (key, index) {
        return DatasetUtil.getValue(this.dataSet, key, index, this.isList);
    };
    BaseVariable.prototype.setValue = function (key, value) {
        return DatasetUtil.setValue(this.dataSet, key, value, this.isList);
    };
    BaseVariable.prototype.getItem = function (index) {
        return DatasetUtil.getItem(this.dataSet, index, this.isList);
    };
    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    BaseVariable.prototype.setItem = function (index, value, options) {
        options = this.getChildDetails(options);
        return DatasetUtil.setItem(this.dataSet, index, value, options);
    };
    /**
     * This method is to get target node options like path, parentIndex and isList
     * @param options: provided options
     * @returns {object}
     * Example: if we have parent dataset as object and we are performing operations on inner list then we have to set isList as true.
     * So finding the target node type and updating the isList option.
     */
    BaseVariable.prototype.getChildDetails = function (options) {
        var parentIndex, isList = this.isList, path;
        if (options && options.path) {
            path = options.path;
            var targetNode = void 0;
            if (isList) {
                parentIndex = options.parentIndex || 0;
                targetNode = _.get(this.dataSet[parentIndex], options.path);
            }
            else {
                targetNode = _.get(this.dataSet, options.path);
            }
            isList = targetNode ? _.isArray(targetNode) ? true : false : true;
        }
        return { path: path, isList: isList, parentIndex: parentIndex };
    };
    BaseVariable.prototype.addItem = function (value, options) {
        var index;
        if (_.isNumber(options)) {
            index = options;
        }
        if (_.isObject(options)) {
            index = options.index;
        }
        options = this.getChildDetails(options);
        return DatasetUtil.addItem(this.dataSet, value, index, options);
    };
    BaseVariable.prototype.removeItem = function (index, options) {
        var exactMatch, parentIndex;
        if (options) {
            if (_.isBoolean(options)) {
                exactMatch = options;
            }
            if (_.isObject(options)) {
                exactMatch = options.exactMatch;
                if (this.isList) {
                    parentIndex = options.parentIndex || 0;
                }
            }
        }
        return DatasetUtil.removeItem(this.dataSet, index, { exactMatch: exactMatch, path: _.get(options, 'path'), parentIndex: parentIndex });
    };
    BaseVariable.prototype.clearData = function () {
        this.dataSet = DatasetUtil.getValidDataset(this.isList);
        return this.dataSet;
    };
    BaseVariable.prototype.getCount = function () {
        return DatasetUtil.getCount(this.dataSet, this.isList);
    };
    /**
     * Return the prefab name if the variable is form a prefab
     * @returns {string}
     */
    BaseVariable.prototype.getPrefabName = function () {
        var prefabname = this._context && (this._context.prefabname || this._context.prefabName);
        // __self__ is a prefab name given to a prefab which is run in preview mode
        return prefabname !== '__self__' && prefabname;
    };
    BaseVariable.prototype.mute = function () {
        this.isMuted = true;
    };
    BaseVariable.prototype.unmute = function () {
        this.isMuted = false;
    };
    BaseVariable.prototype.destroy = function () {
    };
    return BaseVariable;
}());
export { BaseVariable };
//# sourceMappingURL=base-variable.js.map