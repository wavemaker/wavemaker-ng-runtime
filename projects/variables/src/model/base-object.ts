import DatasetUtil from '../util/dataset-util';

export class BaseObject {
    dataSet: any;
    getValue(key: string, index: number) {
        return DatasetUtil.getValue(this, key, index, false);
    }

    setValue(key: string, value: any) {
        return DatasetUtil.setValue(this, key, value, false);
    }
}
