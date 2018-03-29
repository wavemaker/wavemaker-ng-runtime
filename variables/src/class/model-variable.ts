import { VariableManagerFactory } from '../factory/variable-manager.factory';

let manager;
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

        if (!manager) {
            manager = VariableManagerFactory.get(this.category);
        }
    }

    isAction() {
        return false;
    }

    getData() {
        return manager.getData(this);
    }

    setData(dataSet: any) {
        return manager.setData(this, dataSet);
    }

    getValue(key: string, index: number) {
        return manager.getValue(this, key, index);
    }

    setValue(key: string, value: any) {
        return manager.setValue(this, key, value);
    }

    getItem(index: number) {
        return manager.getItem(this, index);
    }

    setItem(index: number, value: any) {
        return manager.setItem(this, index, value);
    }

    addItem(value: any, index: number) {
        return manager.addItem(this, value, index);
    }

    removeItem(index: number, exactMatch: boolean) {
        return manager.removeItem(this, index, exactMatch);
    }

    clearData() {
        return manager.clearData(this);
    }

    getCount() {
        return manager.getCount(this);
    }

    init() {
        manager.initBinding(this, 'dataBinding', 'dataSet');
    }
}
