import { VariableManagerFactory } from '../factory/variable-manager.factory';

export abstract class BaseAction {

    protected _id: string;

    name: string;
    owner: string;
    category: string;
    dataSet: any;
    dataBinding: any;

    getData() {
        return VariableManagerFactory.get('Action').getData(this);
    }

    setData(dataSet: any) {
        return VariableManagerFactory.get('Action').setData(this, dataSet);
    }

    getValue(key: string, index: number) {
        return VariableManagerFactory.get('Action').getValue(this, key, index);
    }

    setValue(key: string, value: any) {
        return VariableManagerFactory.get('Action').setValue(this, key, value);
    }

    getItem(index: number) {
        return VariableManagerFactory.get('Action').getItem(this, index);
    }

    setItem(index: number, value: any) {
        return VariableManagerFactory.get('Action').setItem(this, index, value);
    }

    addItem(value: any, index: number) {
        return VariableManagerFactory.get('Action').addItem(this, value, index);
    }

    removeItem(index: number, exactMatch: boolean) {
        return VariableManagerFactory.get('Action').removeItem(this, index, exactMatch);
    }

    clearData() {
        return VariableManagerFactory.get('Action').clearData(this);
    }

    getCount() {
        return VariableManagerFactory.get('Action').getCount(this);
    }
}