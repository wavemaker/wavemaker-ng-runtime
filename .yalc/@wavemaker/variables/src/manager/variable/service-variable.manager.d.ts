import { ServiceVariable } from '../../model/variable/service-variable';
import { BaseVariableManager } from './base-variable.manager';
export declare class ServiceVariableManager extends BaseVariableManager {
    fileUploadResponse: any;
    fileUploadCount: number;
    totalFilesCount: number;
    successFileUploadCount: number;
    failedFileUploadCount: number;
    /**
     * function to process error response from a service
     * @param {ServiceVariable} variable
     * @param {string} errMsg
     * @param {Function} errorCB
     * @param xhrObj
     * @param {boolean} skipNotification
     * @param {boolean} skipDefaultNotification
     */
    protected processErrorResponse(variable: ServiceVariable, errMsg: string, errorCB: Function, xhrObj?: any, skipNotification?: boolean, skipDefaultNotification?: boolean): void;
    /**
     * function to process success response from a service
     * @param response
     * @param variable
     * @param options
     * @param success
     */
    protected processSuccessResponse(response: any, variable: any, options: any, success: any, resHeaders?: any, operationInf?: any): {
        data: any;
        pagination: any;
    };
    protected uploadFileInFormData(variable: ServiceVariable, options: any, success: Function, error: Function, file: any, requestParams: any): import("../../util/notify-promise").NotifyPromise;
    /**
     * Checks if the user is logged in or not and returns appropriate error
     * If user is not logged in, Session timeout logic is run, for user to login
     * @param variable
     * @returns {any}
     */
    private handleAuthError;
    /**
     * Handles error, when variable's metadata is not found. The reason for this can be:
     *  - API is secure and user is not logged in
     *  - API is secure and user is logged in but not authorized
     *  - The servicedefs are not generated properly at the back end (need to edit the variable and re-run the project)
     * @param info
     * @param variable
     * @param errorCB
     * @param options
     */
    protected handleRequestMetaError(info: any, variable: any, success: any, errorCB: any, options: any): any;
    /**
     * function to transform the service data as according to the variable configuration
     * this is used when 'transformationColumns' property is set on the variable
     * @param data: data returned from the service
     * @variable: variable object triggering the service
     */
    private transformData;
    /**
     * gets the service operation info against a service variable
     * this is extracted from the metadataservice
     * @param variable
     * @param inputFields: sample values, if provided, will be set against params in the definition
     * @param options
     * @returns {any}
     */
    private getMethodInfo;
    /**
     * gets the provider info against a service variable's provider
     * this is extracted from the metadataservice
     * @param variable
     * @param providerId
     * @returns {any}
     */
    private getProviderInfo;
    /**
     * Returns true if any of the files are in onProgress state
     */
    private isFileUploadInProgress;
    protected uploadFile(variable: any, options: any, success: any, error: any, inputFields: any, requestParams: any): import("../../util/notify-promise").NotifyPromise;
    /**
     * proxy for the invoke call
     * Request Info is constructed
     * if error found, error is thrown
     * else, call is made
     * @param {ServiceVariable} variable
     * @param options
     * @param {Function} success
     * @param {Function} error
     * @returns {any}
     * @private
     */
    protected _invoke(variable: ServiceVariable, options: any, success: Function, error: Function): any;
    invoke(variable: any, options: any, success: any, error: any): Promise<unknown>;
    setPagination(variable: any, data: any): void;
    download(variable: any, options: any, successHandler: any, errorHandler: any): any;
    getInputParms(variable: any): any;
    setInput(variable: any, key: any, val: any, options: any): any;
    /**
     * Cancels an on going service request
     * @param variable
     * @param $file
     */
    cancel(variable: any, $file?: any): void;
    defineFirstLastRecord(variable: any): void;
    private getQueryParams;
    /**
     * This method returns filtered records based on searchKey and queryText.
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}
     */
    searchRecords(variable: any, options: any, success: any, error: any): Promise<unknown>;
}
