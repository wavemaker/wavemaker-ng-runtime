import DatasetUtil from '../util/dataset-util';

export abstract class BaseVariable {

    protected _id: string;

    name: string;
    owner: string;
    category: string;
    isList: boolean;
    dataSet: any;
    dataBinding: any;

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
    setItem(index: any, value: any) {
        return DatasetUtil.setItem(this.dataSet, index, value, this.isList);
    }

    addItem(value: any, index: number) {
        return DatasetUtil.addItem(this.dataSet, value, index, this.isList);
    }

    removeItem(index: any, exactMatch: boolean) {
        return DatasetUtil.removeItem(this.dataSet, index, exactMatch);
    }

    clearData() {
        this.dataSet = DatasetUtil.getValidDataset(this.isList);
        return this.dataSet;
    }

    getCount() {
        return DatasetUtil.getCount(this.dataSet, this.isList);
    }

}