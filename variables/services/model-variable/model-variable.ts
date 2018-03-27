import * as SVUtils from './model-variable.util';

export class ModelVariable {

    name: string;
    _id: string;
    owner: string;
    category: string;
    dataSet: any;
    dataBinding: any;
    type: any;
    isList: boolean;
    saveInPhonegap: any;

    constructor(variable: any) {
        Object.assign(this, variable);
    }

    getData() {
        return this.dataSet;
    }

    setData(dataSet: any) {
        return SVUtils.setData(this, dataSet);
    }

    getValue(key: string, index: number) {
        return SVUtils.getValue(this, key, index);
    }

    setValue(key: string, value: any) {
        return SVUtils.setValue(this, key, value);
    }

    getItem(index: number) {
        return SVUtils.getItem(this, index);
    }

    setItem(index: number, value: any) {
        return SVUtils.setItem(this, index, value);
    }

    addItem(value: any, index: number) {
        return SVUtils.addItem(this, value, index);
    }

    removeItem(index: number, exactMatch: boolean) {
        return SVUtils.removeItem(this, index, exactMatch);
    }

    clearData() {
        return SVUtils.clearData(this);
    }

    getCount() {
        return SVUtils.getCount(this);
    }
}
