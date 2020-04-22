import {CrudVariable} from './variable/crud-variable';

export class CRUDCreate {
    constructor(private variable: CrudVariable, private manager) {
    }
    setInput(key, val?, options?) {
        return this.manager.setInput(this.variable, key, val, options, 'create');
    }
}
