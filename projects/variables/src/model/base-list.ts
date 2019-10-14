import DatasetUtil from '../util/dataset-util';

export class BaseList {
    getItem(index: number) {
        return DatasetUtil.getItem(this, index, true);
    }

    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    setItem(index: any, value: any) {
        return DatasetUtil.setItem(this, index, value, true);
    }

    addItem(value: any, index?: number) {
        return DatasetUtil.addItem(this, value, index, true);
    }

    removeItem(index: any, exactMatch?: boolean) {
        return DatasetUtil.removeItem(this, index, exactMatch);
    }
}
