export declare let appManager: any;
export declare let httpService: any;
export declare let metadataService: any;
export declare let navigationService: any;
export declare let routerService: any;
export declare let toasterService: any;
export declare let oauthService: any;
export declare let securityService: any;
export declare let dialogService: any;
export declare let internalBoundNodeMap: Map<any, any>;
export declare const wmSetDependency: (type: string, ref: any) => void;
export declare const debounceVariableCall: (variable: any, op: any) => void;
/**
 * returns true if HTML5 File API is available else false
 * @returns {{prototype: Blob; new(blobParts?: any[], options?: BlobPropertyBag): Blob}}
 */
export declare const isFileUploadSupported: () => any;
/**
 * formatting the expression as required by backend which was enclosed by ${<expression>}.
 * @param fieldDefs
 * returns fieldDefs
 */
export declare const formatExportExpression: (fieldDefs: any) => any;
/**
 * prepare a blob object based on the content and content type provided
 * if content is blob itself, simply returns it back
 * @param val
 * @param valContentType
 * @returns {*}
 */
export declare const getBlob: (val: any, valContentType?: any) => any;
/**
 * sets the value against passed key on the "inputFields" object in the variable
 * @param targetObj: the object in which the key, value is to be set
 * @param variable
 * @param key: can be:
 *  - a string e.g. "username"
 *  - an object, e.g. {"username": "john", "ssn": "11111"}
 * @param val
 * - if key is string, the value against it (for that data type)
 * - if key is object, not required
 * @param options
 * @returns {any}
 */
export declare const setInput: (targetObj: any, key: any, val: any, options: any) => any;
/**
 * This method decodes the variable data which is encoded from backend before showing in the widgets.
 * It takes variable response content as input and iterates recursively,
 * if the value is string type then it will decode the data.
 * @param responseContent (Array of objects)
 */
export declare const decodeData: (responseContent: any) => any;
/**
 *
 * @param varOrder
 * @param optionsOrder
 * @returns {any}
 */
export declare const getEvaluatedOrderBy: (varOrder: any, optionsOrder: any) => any;
/**
* Returns the object node for a bind object, where the value has to be updated
* obj.target = "a"
    * @param obj
* @param root
* @param variable
* @returns {*}
*/
export declare const getTargetObj: (obj: any, root: any, variable: any) => any;
/**
 * Gets the key for the target object
 * the computed value will be updated against this key in the targetObject(computed by getTargetObj())
 * @param target
 * @param regex
 * @returns {*}
 */
export declare const getTargetNodeKey: (target: any) => any;
export declare const setValueToNode: (target: any, obj: any, root: any, variable: any, value: any, noUpdate?: any) => void;
export declare const getTarget: (variable: any) => any;
/**
 * The model internalBoundNodeMap stores the reference to latest computed values against internal(nested) bound nodes
 * This is done so that the internal node's computed value is not lost, once its parent node's value is computed at a later point
 * E.g.
 * Variable.employeeVar has following bindings
 * "dataBinding": [
 {
         "target": "department.budget",
         "value": "bind:Variables.budgetVar.dataSet"
     },
 {
         "target": "department",
         "value": "bind:Variables.departmentVar.dataSet"
     }
 ]
 * When department.budget is computed, employeeVar.dataSet = {
 *  "department": {
 *      "budget": {"q1": 1111}
 *  }
 * }
 *
 * When department is computed
 *  "department": {
 *      "name": "HR",
 *      "location": "Hyderabad"
 *  }
 * The budget field (computed earlier) is LOST.
 *
 * To avoid this, the latest values against internal nodes (in this case department.budget) are stored in a map
 * These values are assigned back to internal fields if the parent is computed (in this case department)
 * @param target
 * @param root
 * @param variable
 */
export declare const updateInternalNodes: (target: any, root: any, variable: any) => void;
export declare const initiateCallback: (type: string, variable: any, data: any, options?: any, skipDefaultNotification?: boolean) => any;
export declare const formatDate: (value: any, type: any) => any;
