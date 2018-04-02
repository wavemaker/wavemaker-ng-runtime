import * as LVUtils from '../../util/variable/live-variable.utils';
import { BaseVariableManager } from './base-variable.manager';

export class LiveVariableManager extends BaseVariableManager {

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

    getRelatedTablePrimaryKeys(variable, columnName) {
        return LVUtils.getRelatedTablePrimaryKeys(variable, columnName);
    }

    getRelatedTableData(variable, columnName, options, success, error) {
        LVUtils.getRelatedTableData(variable, columnName, options, success, error);
    }

    getDistinctDataByFields(variable, options, success, error) {
        LVUtils.getDistinctDataByFields(variable, options, success, error);
    }
}