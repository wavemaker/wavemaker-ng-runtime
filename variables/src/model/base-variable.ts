import { DataSource } from '@wm/core';

import DatasetUtil from '../util/dataset-util';
declare const _;

export abstract class BaseVariable {

    protected _id: string;

    name: string;
    owner: string;
    category: string;
    isList: boolean;
    dataSet: any;
    dataBinding: any;
    _context: any;

    execute(operation, options) {
        let returnVal;
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
                returnVal = this.setItem(options.prevItem, options.item,  _.omit(options, 'prevItem', 'item'));
                break;
            case DataSource.Operation.REMOVE_ITEM:
                returnVal = this.removeItem(options.item, _.omit(options, 'item'));
                break;
        }
        return returnVal;
    }

    getData() {
        return this.dataSet;
    }

    setData(dataSet: any) {
        if (DatasetUtil.isValidDataset(dataSet, this.isList)) {
            this.dataSet = dataSet;
        }
        return this.dataSet;
    }

    getValue(key: string, index: number) {
        return DatasetUtil.getValue(this.dataSet, key, index, this.isList);
    }

    setValue(key: string, value: any) {
        return DatasetUtil.setValue(this.dataSet, key, value, this.isList);
    }

    getItem(index: number) {
        return DatasetUtil.getItem(this.dataSet, index, this.isList);
    }

    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    setItem(index: any, value: any, options?: any) {
        options = this.getChildDetails(options);
        return DatasetUtil.setItem(this.dataSet, index, value, options);
    }

    /**
     * This method is to get target node options like path, parentIndex and isList
     * @param options: provided options
     * @returns {object}
     * Example: if we have parent dataset as object and we are performing operations on inner list then we have to set isList as true.
     * So finding the target node type and updating the isList option.
     */
    private getChildDetails (options) {
        let parentIndex, isList = this.isList, path;
        if (options && options.path) {
            path = options.path;
            let targetNode;
            if (isList) {
                parentIndex = options.parentIndex || 0;
                targetNode =  _.get(this.dataSet[parentIndex], options.path);
            } else {
                targetNode = _.get(this.dataSet, options.path);
            }
            isList = targetNode ? _.isArray(targetNode) ? true : false : true;
        }
        return {path, isList, parentIndex};
    }

    addItem(value: any, options?) {
        let index;
        if (options) {
            if (_.isNumber(options)) {
                index = options;
            }
            if (_.isObject(options)) {
                index = options.index;
            }
            options = this.getChildDetails(options);
        }
        return DatasetUtil.addItem(this.dataSet, value, index, options);
    }

    removeItem(index: any, options?: any) {
        let exactMatch, parentIndex;
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
        return DatasetUtil.removeItem(this.dataSet, index, { exactMatch, path: options.path, parentIndex });
    }

    clearData() {
        this.dataSet = DatasetUtil.getValidDataset(this.isList);
        return this.dataSet;
    }

    getCount() {
        return DatasetUtil.getCount(this.dataSet, this.isList);
    }

    /**
     * Return the prefab name if the variable is form a prefab
     * @returns {string}
     */
    getPrefabName() {
        return this._context && this._context.prefabName;
    }

}