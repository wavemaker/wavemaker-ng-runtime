import { ServiceVariable } from './service-variable';
import { VariableManagerFactory } from './../factory/variable-manager.factory';

let manager;
export class LiveVariable extends ServiceVariable {

    constructor(variable: any) {
        super(variable);
        Object.assign(this, variable);
        manager = manager || VariableManagerFactory.get(this.category);
    }

    listRecords(options?, success?, error?) {
        return manager.listRecords(this, options, success, error);
    }

    updateRecord(options?, success?, error?) {
        return manager.updateRecord(this, options, success, error);
    }

    insertRecord(options?, success?, error?) {
        return manager.insertRecord(this, options, success, error);
    }

    deleteRecord(options?, success?, error?) {
        return manager.deleteRecord(this, options, success, error);
    }

    setInput(key, val, options) {
        return manager.setInput(this, key, val, options);
    }

    setFilter(key, val) {
        return manager.setFilter(this, key, val);
    }

    download(options?) {
        return manager.download(this, options);
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
        manager.initBinding(this, 'dataBinding', this.operation === 'read' ? 'filterFields' : 'inputFields');
        if (this.startUpdate) {
            this.invoke();
        }
    }
}
