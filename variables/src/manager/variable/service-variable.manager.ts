import { $invokeWatchers, getClonedObject, getValidJSON, isDefined, isPageable, isValidWebURL, noop, triggerFn, xmlToJson } from '@wm/core';

import { upload } from '../../util/file-upload.util';
import { ServiceVariable } from '../../model/variable/service-variable';
import { ServiceVariableUtils } from '../../util/variable/service-variable.utils';
import { $queue } from '../../util/inflight-queue';
import { BaseVariableManager } from './base-variable.manager';
import { CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS } from '../../constants/variables.constants';
import { appManager, formatExportExpression, setInput } from './../../util/variable/variables.utils';
import { getEvaluatedOrderBy, httpService, initiateCallback, metadataService, securityService, simulateFileDownload } from '../../util/variable/variables.utils';
import { getAccessToken, performAuthorization, removeAccessToken } from '../../util/oAuth.utils';
import { AdvancedOptions } from '../../advanced-options';

declare const _;

export class ServiceVariableManager extends BaseVariableManager {

    fileUploadResponse: any = [];
    fileUploadCount = 0;
    successFileUploadCount = 0;
    failedFileUploadCount = 0;

    /**
     * function to process error response from a service
     * @param {ServiceVariable} variable
     * @param {string} errMsg
     * @param {Function} errorCB
     * @param xhrObj
     * @param {boolean} skipNotification
     * @param {boolean} skipDefaultNotification
     */
    private processErrorResponse(variable: ServiceVariable, errMsg: string, errorCB: Function, xhrObj?: any, skipNotification?: boolean, skipDefaultNotification?: boolean) {
        // EVENT: ON_ERROR
        if (!skipNotification) {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, errMsg, xhrObj, skipDefaultNotification);
        }
        const methodInfo = this.getMethodInfo(variable, {}, {});
        const securityDefnObj = _.get(methodInfo, 'securityDefinitions.0');
        const advancedOptions: AdvancedOptions = {xhrObj: xhrObj};
        if (_.get(securityDefnObj, 'type') === VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.OAUTH2
            && _.includes([VARIABLE_CONSTANTS.HTTP_STATUS_CODE.UNAUTHORIZED, VARIABLE_CONSTANTS.HTTP_STATUS_CODE.FORBIDDEN], _.get(xhrObj, 'status'))) {
            removeAccessToken(securityDefnObj['x-WM-PROVIDER_ID']);
        }
        /* trigger error callback */
        triggerFn(errorCB, errMsg);

        if (!CONSTANTS.isStudioMode) {
            /* process next requests in the queue */
            variable.canUpdate = true;
            $queue.process(variable);

            // EVENT: ON_CAN_UPDATE
            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, errMsg, advancedOptions);
        }
    }

    /**
     * function to process success response from a service
     * @param response
     * @param variable
     * @param options
     * @param success
     */
    private processSuccessResponse(response, variable, options, success) {
        let dataSet, newDataSet, pagination = {}, advancedOptions: AdvancedOptions ;

        response = getValidJSON(response) || xmlToJson(response) || response;

        const isResponsePageable = isPageable(response);
        if (isResponsePageable) {
            dataSet = response.content;
            pagination = _.omit(response, 'content');
            advancedOptions = {xhrObj: options.xhrObj, pagination: pagination};
        } else {
            dataSet = response;
            advancedOptions = {xhrObj: options.xhrObj};
        }

        // EVENT: ON_RESULT
        initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response, advancedOptions);

        // trigger success callback, pass data received from server as it is.
        triggerFn(success, response, pagination);

        /* if dataTransformation enabled, transform the data */
        if (variable.transformationColumns) {
            response = this.transformData(response, variable);
        }

        // if a primitive type response is returned, wrap it in an object
        dataSet = (!_.isObject(dataSet)) ? {'value': dataSet} : dataSet;

        // EVENT: ON_PREPARE_SETDATA
        newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, dataSet, advancedOptions);
        if (isDefined(newDataSet)) {
            // setting newDataSet as the response to service variable onPrepareSetData
            dataSet = newDataSet;
        }

        /* update the dataset against the variable, if response is non-object, insert the response in 'value' field of dataSet */
        if (!options.forceRunMode && !options.skipDataSetUpdate) {
            variable.pagination = pagination;
            variable.dataSet = dataSet;

            // legacy properties in dataSet, [content]
            if (isResponsePageable) {
                Object.defineProperty(variable.dataSet, 'content', {
                    get: () => {
                        return variable.dataSet;
                    }
                });
            }
        }

        $invokeWatchers(true);
        setTimeout(() => {
            // EVENT: ON_SUCCESS
            initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, dataSet, advancedOptions);

            if (!CONSTANTS.isStudioMode) {
                /* process next requests in the queue */
                variable.canUpdate = true;
                $queue.process(variable);
            }

            // EVENT: ON_CAN_UPDATE
            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, dataSet, advancedOptions);
        });

        return {
            data: variable.dataSet,
            pagination: variable.pagination
        };
    }

    private uploadFileInFormData(variable: ServiceVariable, options: any, success: Function, error: Function, file, requestParams, fileCount) {
        const promise = upload(file, requestParams.data, {
            fileParamName: 'files',
            url: requestParams.url
        });
        (promise as any).then((data) => {
            this.fileUploadCount++;
            this.successFileUploadCount++;
            this.fileUploadResponse.push(data);
            if (fileCount === this.fileUploadCount) {
                if (this.failedFileUploadCount === 0) {
                    this.processSuccessResponse(this.fileUploadResponse, variable, options, success);
                    this.fileUploadResponse = [];
                    appManager.notifyApp(appManager.getAppLocale().MESSAGE_FILE_UPLOAD_SUCCESS, 'success');
                } else {
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, this.fileUploadResponse);
                    this.fileUploadResponse = [];
                    appManager.notifyApp(appManager.getAppLocale().MESSAGE_FILE_UPLOAD_ERROR, 'error');
                }
                this.fileUploadCount = 0;
                this.successFileUploadCount = 0;
            }
            return data;
        }, (e) => {
            this.fileUploadCount++;
            this.failedFileUploadCount++;
            this.fileUploadResponse.push(e);
            if (fileCount === this.fileUploadCount) {
                this.processErrorResponse(variable, this.fileUploadResponse, error, options.xhrObj, options.skipNotification);
                this.fileUploadResponse = [];
                this.fileUploadCount = 0;
                this.failedFileUploadCount = 0;
            }
            return e;
        }, (data) => {
            if (variable._progressObservable) {
                variable._progressObservable.next({'progress': data, 'status': VARIABLE_CONSTANTS.EVENT.PROGRESS, 'fileName': file.name});
            }
            initiateCallback(VARIABLE_CONSTANTS.EVENT.PROGRESS, variable, data);
            return data;
        });
        return promise;
    }

    /**
     * Checks if the user is logged in or not and returns appropriate error
     * If user is not logged in, Session timeout logic is run, for user to login
     * @param variable
     * @returns {any}
     */
    private handleAuthError(variable, success, errorCB, options) {
        const isUserAuthenticated = _.get(securityService.get(), 'authenticated');
        let info;

        if (isUserAuthenticated) {
            info = {
                error: {
                    message: 'You\'re not authorised to access the resource "' + variable.service + '".'
                }
            };
        } else {
            info = {
                error: {
                    message: 'You\'re not authenticated to access the resource "' + variable.service + '".',
                    skipDefaultNotification: true
                }
            };
            appManager.pushToSessionFailureRequests(variable.invoke.bind(variable, options, success, errorCB));
            appManager.handle401();
        }
        return info;
    }

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
    private handleRequestMetaError(info, variable, success, errorCB, options) {
        const err_type = _.get(info, 'error.type');

        switch (err_type) {
            case VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.NO_ACCESSTOKEN:
                performAuthorization(undefined, info.securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY], this.invoke.bind(this, variable, options, null, errorCB), null);
                this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, true, true);
                break;
            case VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.USER_UNAUTHORISED:
                info = this.handleAuthError(variable, success, errorCB, options);
                this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
                break;
            case VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.METADATA_MISSING:
                this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
                break;
            default:
                if (info.error.message) {
                    console.warn(info.error.message, variable.name);
                    this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
                }
        }
        return info;
    }

    /**
     * function to transform the service data as according to the variable configuration
     * this is used when 'transformationColumns' property is set on the variable
     * @param data: data returned from the service
     * @variable: variable object triggering the service
     */
    private transformData(data, variable) {
        data.wmTransformedData = [];

        const columnsArray = variable.transformationColumns,
            dataArray = _.get(data, variable.dataField) || [],
            transformedData = data.wmTransformedData;

        _.forEach(dataArray, function (datum, index) {
            transformedData[index] = {};
            _.forEach(columnsArray, function (column, columnIndex) {
                transformedData[index][column] = datum[columnIndex];
            });
        });
        return data;
    }

    /**
     * gets the service operation info against a service variable
     * this is extracted from the metadataservice
     * @param variable
     * @param inputFields: sample values, if provided, will be set against params in the definition
     * @param options
     * @returns {any}
     */
    private getMethodInfo(variable, inputFields, options) {
        const serviceDef = getClonedObject(metadataService.getByOperationId(variable.operationId, variable.getPrefabName()));
        const methodInfo = serviceDef === null ? null : _.get(serviceDef, 'wmServiceOperationInfo');
        if (!methodInfo) {
            return methodInfo;
        }
        const securityDefnObj = _.get(methodInfo.securityDefinitions, '0'),
            isOAuthTypeService = securityDefnObj && (securityDefnObj.type === VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.OAUTH2);
        if (methodInfo.parameters) {
            methodInfo.parameters.forEach(function (param) {
                // Ignore readOnly params in case of formData file params will be duplicated
                if (param.readOnly) {
                    return;
                }
                param.sampleValue = inputFields[param.name];
                /* supporting pagination for query service variable */
                if (VARIABLE_CONSTANTS.PAGINATION_PARAMS.indexOf(param.name) !== -1) {
                    if (param.name === 'size') {
                        param.sampleValue = options.size || param.sampleValue || parseInt(variable.maxResults, 10);
                    } else if (param.name === 'page') {
                        param.sampleValue = options.page || param.sampleValue || 1;
                    } else if (param.name === 'sort') {
                        param.sampleValue = getEvaluatedOrderBy(variable.orderBy, options.orderBy) || param.sampleValue || '';
                    }
                } else if (param.name === 'access_token' && isOAuthTypeService) {
                    param.sampleValue = getAccessToken(securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY], null);
                }
            });
        }
        return methodInfo;
    }

    /**
     * makes the HTTP call with given params
     * @param params
     * @returns {any}
     */
    private makeCall(params) {
        params.responseType = 'text';
        return httpService.send(params);
    }

    // Makes the call for Uploading file/ files
    private uploadFile(variable, options, success, error, inputFields, requestParams ) {
        let fileParamCount = 0;
        const fileArr: any = [], promArr: any = [];
        _.forEach(inputFields, (inputField) => {
            if (_.isArray(inputField)) {
                if (inputField[0] instanceof File) {
                    fileParamCount++;
                }
                _.forEach(inputField, (input) => {
                    if (input instanceof File || _.find(_.values(input), o => o instanceof Blob)) {
                        fileArr.push(input);
                        fileParamCount = fileParamCount || 1;
                    }
                });
            } else {
                if (inputField instanceof File) {
                    fileParamCount++;
                    fileArr.push(inputField);
                }
            }
        });
        if (fileParamCount === 1) {
            if (inputFields.files.length > 1) {
                _.forEach(fileArr, (file) => {
                    promArr.push(this.uploadFileInFormData(variable, options, success, error, file, requestParams, inputFields.files.length));
                });
                return Promise.all(promArr);
            } else {
                return this.uploadFileInFormData(variable, options, success, error, fileArr[0], requestParams, 1);
            }
        }
    }

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
    private _invoke (variable: ServiceVariable, options: any, success: Function, error: Function) {
        let inputFields = getClonedObject(options.inputFields || variable.dataBinding);
        // EVENT: ON_BEFORE_UPDATE
        const output: any = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, inputFields, options);

        if (output === false) {
            triggerFn(error);
            return;
        }
        if (_.isObject(output)) {
            inputFields = output;
        }

        const operationInfo = this.getMethodInfo(variable, inputFields, options),
            requestParams = ServiceVariableUtils.constructRequestParams(variable, operationInfo, inputFields);

        // check errors
        if (requestParams.error) {
            const info = this.handleRequestMetaError(requestParams, variable, success, error, options);
            const reason = (_.get(info, 'error.message') || 'An error occurred while triggering the variable: ') + ': ' +  variable.name;
            return Promise.reject(reason);
        }

        // file upload
        if (ServiceVariableUtils.isFileUploadRequest(variable)) {
            const uploadPromise = this.uploadFile(variable, options, success, error, inputFields, requestParams);
            if (uploadPromise) {
                return uploadPromise;
            }
        }

        // file download
        if (operationInfo && _.isArray(operationInfo.produces) && _.includes(operationInfo.produces, WS_CONSTANTS.CONTENT_TYPES.OCTET_STREAM)) {
            return simulateFileDownload(requestParams, variable.dataBinding.file || variable.name, variable.dataBinding.exportType, function () {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, null, null, null);
                $queue.process(variable);
                triggerFn(success);
            }, function () {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null, null, null);
                triggerFn(error);
            });
        }

        // notify variable progress
        this.notifyInflight(variable, !options.skipToggleState);

        // make the call
        return this.makeCall(requestParams).then((response) => {
            const data = this.processSuccessResponse(response.body, variable, _.extend(options, {'xhrObj': response }), success);
            // notify variable success
            this.notifyInflight(variable, false, data);
            return Promise.resolve(data);
        }, (e) => {
            // notify variable error
            this.notifyInflight(variable, false);
            this.processErrorResponse(variable, e.error, error, e.details, options.skipNotification);
            return Promise.reject(e);
        });
    }

    // *********************************************************** PUBLIC ***********************************************************//

    public invoke(variable, options, success, error) {
        options = options || {};
        options.inputFields = options.inputFields || getClonedObject(variable.dataBinding);
        return $queue.submit(variable).then(this._invoke.bind(this, variable, options, success, error), error);
    }

    public download(variable, options, successHandler, errorHandler) {
        options = options || {};
        const inputParams  = getClonedObject(variable.dataBinding);
        const inputData = options.data || {};
        const methodInfo   = this.getMethodInfo(variable, inputParams, options);
        let requestParams;

        methodInfo.relativePath += '/export';
        requestParams = ServiceVariableUtils.constructRequestParams(variable, methodInfo, inputParams);

        requestParams.data = inputData;
        requestParams.data.fields = formatExportExpression(inputData.fields || []);

        // extra options provided, these may be used in future for integrating export feature with ext. services
        requestParams.method = options.httpMethod || 'POST';
        requestParams.url = options.url || requestParams.url;

        // If request params returns error then show an error toaster
        if (_.hasIn(requestParams, 'error.message')) {
            triggerFn(errorHandler, requestParams.error.message);
            return Promise.reject(requestParams.error.message);
        }
        return httpService.send(requestParams).then(response => {
            if (response && isValidWebURL(response.body.result)) {
                window.location.href = response.body.result;
                triggerFn(successHandler, response);
            } else {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response);
                triggerFn(errorHandler, response);
            }
        }, (response, xhrObj) => {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response, xhrObj);
            triggerFn(errorHandler, response);
        });
    }

    public getInputParms(variable) {
        const wmServiceOperationInfo = _.get(metadataService.getByOperationId(variable.operationId), 'wmServiceOperationInfo');
        return _.get(wmServiceOperationInfo, 'parameters');
    }

    public setInput(variable, key, val, options) {
        return setInput(variable.dataBinding, key, val, options);
    }

    public cancel(variable) {
        console.warn('Yet to be implemented!');
    }

    public defineFirstLastRecord(variable) {
        if (variable.isList) {
            Object.defineProperty(variable, 'firstRecord', {
                'configurable': true,
                'get': function () {
                    const dataSet = variable.dataSet;
                    // For procedure(v1) data doesn't come under content
                    return _.head(dataSet && dataSet.content) || _.head(dataSet) || {};
                }
            });
            Object.defineProperty(variable, 'lastRecord', {
                'configurable': true,
                'get': function () {
                    const dataSet = variable.dataSet;
                    // For procedure(v1) data doesn't come under content
                    return _.last(dataSet && dataSet.content) || _.last(dataSet) || {};
                }
            });
        }
    }

    // Gets the input params of the service variable and also add params from the searchKeys (filterfields)
    private getQueryParams(filterFields, searchValue, variable) {
        const inputParams = this.getInputParms(variable);
        const queryParams = ServiceVariableUtils.excludePaginationParams(inputParams);
        const inputFields = {};

        // check if some param value is already available in databinding and update the inputFields accordingly
        _.map(variable.dataBinding, function (value, key) {
            inputFields[key] = value;
        });

        // add the query params mentioned in the searchkey to inputFields
        _.forEach(filterFields, function (value) {
            if (_.includes(queryParams, value)) {
                inputFields[value] = searchValue;
            }
        });

        return inputFields;
    }

    /**
     * This method returns filtered records based on searchKey and queryText.
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}
     */
    public searchRecords(variable, options, success, error) {
        const inputFields = this.getQueryParams(_.split(options.searchKey, ','), options.query, variable);

        const requestParams = {
            page: options.page,
            pagesize: options.pagesize,
            skipDataSetUpdate: true, // dont update the actual variable dataset,
            skipToggleState: true, // Dont change the varibale toggle state as this is a independent call
            inFlightBehavior: 'executeAll',
            inputFields: inputFields
        };

        if (options.onBeforeservicecall) {
            options.onBeforeservicecall(inputFields);
        }

        return this.invoke(variable, requestParams, success, error).catch(noop);
    }
}
