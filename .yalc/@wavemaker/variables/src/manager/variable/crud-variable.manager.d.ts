import { CrudVariable } from '../../model/variable/crud-variable';
import { ServiceVariableManager } from './service-variable.manager';
export declare class CrudVariableManager extends ServiceVariableManager {
    fileUploadResponse: any;
    fileUploadCount: number;
    totalFilesCount: number;
    successFileUploadCount: number;
    failedFileUploadCount: number;
    private getPaginationInfo;
    private getOperationInfo;
    /**
     * gets the service operation info against a service variable
     * this is extracted from the metadataservice
     * @param variable
     * @param inputFields: sample values, if provided, will be set against params in the definition
     * @param options
     * @returns {any}
     */
    private getMethodInfoForCrud;
    /**
     * proxy for the invoke call
     * Request Info is constructed
     * if error found, error is thrown
     * else, call is made
     * @param {CrudVariable} variable
     * @param options
     * @param {Function} success
     * @param {Function} error
     * @returns {any}
     * @private
     */
    protected _invoke(variable: CrudVariable, options: any, success: Function, error: Function): any;
    invoke(variable: any, options: any, success: any, error: any): Promise<unknown>;
    getInputParms(variable: any): any;
    setInput(variable: any, key: any, val: any, options: any, type?: any): any;
    /**
     * Initializes the bindings for the CRUD variable
     * flatten the bindings (categorised by operation name) to a list of bindings
     * each binding object's target is changed appended with the operation type
     * E.g. Input binding will be like:
     {
       "list": [
         {
           "target": "q",
           "type": "string",
           "value": "X"
         }
       ],
       "update": [
         {
           "target": "id",
           "value": "bind:Widgets.UserControllerTable2.selecteditem.userId",
           "type": "integer"
         }
       ]
     }

     * This function will convert it to
     [
         {
           "target": "list.q",
           "type": "string",
           "value": "X"
         },
         {
           "target": "update.id",
           "value": "bind:Widgets.UserControllerTable2.selecteditem.userId",
           "type": "integer"
         }
     ]

     * The bindings will be evaluated through the base-manager initBinding method and will
     * be stored in variable.dataBinding as follows:
     {
        list: {
            q: "X"
        },
        update: {
            id: "evaluated value"
        }
     }
     * @param variable
     */
    initBinding(variable: any): void;
}
