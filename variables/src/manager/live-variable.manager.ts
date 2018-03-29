import { ModelVariableManager } from './model-variable.manager';
import * as LVUtils from '../utils/live-variable.utils';

export class LiveVariableManager extends ModelVariableManager{

    invoke(variable, options, success, error) {
        LVUtils.listRecords(variable, options, success, error);
    }

    listRecords(variable, options, success, error) {
        LVUtils.listRecords(variable, options, success, error);
    }

    updateRecord(variable, options, success, error) {
        LVUtils.updateRecord(variable, options, success, error);
    }

    insertRecord(variable, options, success, error) {
        LVUtils.insertRecord(variable, options, success, error);
    }

    deleteRecord(variable, options, success, error) {
        LVUtils.deleteRecord(variable, options, success, error);
    }

    setInput(variable, key, val, options) {
        return LVUtils.setInput(variable, key, val, options);
    }

    setFilter(variable, key, val) {
        return LVUtils.setFilter(variable, key, val);
    }

    download(variable, options) {
        LVUtils.download(variable, options);
    }
}