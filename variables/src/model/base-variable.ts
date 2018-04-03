import { VariableManagerFactory } from '../factory/variable-manager.factory';

const  getManager = () => {
    return VariableManagerFactory.get('Variable');
};

export abstract class BaseVariable {

    protected _id: string;

    name: string;
    owner: string;
    category: string;
    dataSet: any;
    dataBinding: any;

    getData() {
        return getManager().getData(this);
    }

    setData(dataSet: any) {
        return getManager().setData(this, dataSet);
    }

    getValue(key: string, index: number) {
        return getManager().getValue(this, key, index);
    }

    setValue(key: string, value: any) {
        return getManager().setValue(this, key, value);
    }

    getItem(index: number) {
        return getManager().getItem(this, index);
    }

    setItem(index: number, value: any) {
        return getManager().setItem(this, index, value);
    }

    addItem(value: any, index: number) {
        return getManager().addItem(this, value, index);
    }

    removeItem(index: number, exactMatch: boolean) {
        return getManager().removeItem(this, index, exactMatch);
    }

    clearData() {
        return getManager().clearData(this);
    }

    getCount() {
        return getManager().getCount(this);
    }
}