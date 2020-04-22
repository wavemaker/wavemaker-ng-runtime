import {CrudVariable} from './variable/crud-variable';

export class CRUDDelete {
    constructor(private variable: CrudVariable, private manager) {
    }
    setInput(key, val?, options?) {
        return this.manager.setInput(this.variable, key, val, options, 'delete');
    }
}
