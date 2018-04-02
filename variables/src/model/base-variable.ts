import { VariableManagerFactory } from '../factory/variable-manager.factory';

export abstract class BaseVariable {

    protected _id: string;

    name: string;
    owner: string;
    category: string;
    dataSet: any;
    dataBinding: any;

    // TODO[Vibhu]: to be removed
    isAction() {
        return false;
    }

    getData() {
        return VariableManagerFactory.get('Variable').getData(this);
    }

    setData(dataSet: any) {
        return VariableManagerFactory.get('Variable').setData(this, dataSet);
    }

    getValue(key: string, index: number) {
        return VariableManagerFactory.get('Variable').getValue(this, key, index);
    }

    setValue(key: string, value: any) {
        return VariableManagerFactory.get('Variable').setValue(this, key, value);
    }

    getItem(index: number) {
        return VariableManagerFactory.get('Variable').getItem(this, index);
    }

    setItem(index: number, value: any) {
        return VariableManagerFactory.get('Variable').setItem(this, index, value);
    }

    addItem(value: any, index: number) {
        return VariableManagerFactory.get('Variable').addItem(this, value, index);
    }

    removeItem(index: number, exactMatch: boolean) {
        return VariableManagerFactory.get('Variable').removeItem(this, index, exactMatch);
    }

    clearData() {
        return VariableManagerFactory.get('Variable').clearData(this);
    }

    getCount() {
        return VariableManagerFactory.get('Variable').getCount(this);
    }
}