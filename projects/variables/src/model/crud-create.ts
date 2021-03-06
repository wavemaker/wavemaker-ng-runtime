import {CrudVariable} from './variable/crud-variable';

export class CRUDCreate {
    constructor(private variable: CrudVariable, private manager) {
    }
    setInput(key, val?, options?) {
        return this.manager.setInput(this.variable, key, val, options, 'create');
    }
    invoke(options?, success?, error?) {
        options = options || {};
        options.operation = 'create';
        return this.manager.invoke(this.variable, options, success, error);
    }
}
