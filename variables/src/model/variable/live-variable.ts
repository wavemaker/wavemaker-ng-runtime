import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';

export class LiveVariable extends ApiAwareVariable {

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    listRecords(options?, success?, error?) {
        return VariableManagerFactory.get(this.category).listRecords(this, options, success, error);
    }

    updateRecord(options?, success?, error?) {
        return VariableManagerFactory.get(this.category).updateRecord(this, options, success, error);
    }

    insertRecord(options?, success?, error?) {
        return VariableManagerFactory.get(this.category).insertRecord(this, options, success, error);
    }

    deleteRecord(options?, success?, error?) {
        return VariableManagerFactory.get(this.category).deleteRecord(this, options, success, error);
    }

    setInput(key, val, options) {
        return VariableManagerFactory.get(this.category).setInput(this, key, val, options);
    }

    setFilter(key, val) {
        return VariableManagerFactory.get(this.category).setFilter(this, key, val);
    }

    download(options?) {
        return VariableManagerFactory.get(this.category).download(this, options);
    }

    invoke(options?, success?, error?) {
        switch(this.operation) {
            case 'insert':
                return this.insertRecord(options, success, error);
            case 'update':
                return this.updateRecord(options, success, error);
            case 'delete':
                return this.deleteRecord(options, success, error);
            default:
                return this.listRecords(options, success, error);
        }
    }

    // legacy method
    update(options?, success?, error?) {
        return this.invoke(options, success, error);
    }

    init() {
        VariableManagerFactory.get(this.category).initBinding(this, 'dataBinding', this.operation === 'read' ? 'filterFields' : 'inputFields');
        if (this.startUpdate) {
            this.invoke();
        }
    }
}
