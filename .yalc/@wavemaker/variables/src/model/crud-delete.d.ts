import { CrudVariable } from './variable/crud-variable';
export declare class CRUDDelete {
    private variable;
    private manager;
    constructor(variable: CrudVariable, manager: any);
    setInput(key: any, val?: any, options?: any): any;
    invoke(options?: any, success?: any, error?: any): any;
}
