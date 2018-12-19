import { DataSource } from '@wm/core';

import DatasetUtil from '../util/dataset-util';

export abstract class BaseAction {

    protected _id: string;

    name: string;
    owner: string;
    category: string;
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
        }
        return returnVal;
    }

    getData() {
        return this.dataSet;
    }

    setData(dataSet: any) {
        if (DatasetUtil.isValidDataset(dataSet)) {
            this.dataSet = dataSet;
        }
        return this.dataSet;
    }

    getValue(key: string, index: number) {
        return DatasetUtil.getValue(this.dataSet, key, index);
    }

    setValue(key: string, value: any) {
        return DatasetUtil.setValue(this.dataSet, key, value);
    }

    getItem(index: number) {
        return DatasetUtil.getItem(this.dataSet, index);
    }

    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    setItem(index: any, value: any) {
        return DatasetUtil.setItem(this.dataSet, index, value);
    }

    addItem(value: any, index: number) {
        return DatasetUtil.addItem(this.dataSet, value, index);
    }

    removeItem(index: any, exactMatch: boolean) {
        return DatasetUtil.removeItem(this.dataSet, index, exactMatch);
    }

    clearData() {
        this.dataSet = DatasetUtil.getValidDataset();
        return this.dataSet;
    }

    getCount() {
        return DatasetUtil.getCount(this.dataSet);
    }

    init() {
    }
}
