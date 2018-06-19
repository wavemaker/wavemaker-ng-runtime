import { getClonedObject, getValidJSON, isDefined, triggerFn, xmlToJson } from '@wm/core';

import { upload } from '../../util/file-upload.util';
import { ServiceVariable } from '../../model/variable/service-variable';
import { ServiceVariableUtils } from '../../util/variable/service-variable.utils';
import { $queue } from '../../util/inflight-queue';
import { BaseVariableManager } from './base-variable.manager';
import { CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS } from '../../constants/variables.constants';
import { setInput } from './../../util/variable/variables.utils';
import { getEvaluatedOrderBy, httpService, initiateCallback, metadataService, simulateFileDownload } from '../../util/variable/variables.utils';
import { getAccessToken, performAuthorization, removeAccessToken } from '../../util/oAuth.utils';

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
        const methodInfo = this.getMethodInfo(variable, {}, {}),
            securityDefnObj = _.get(methodInfo, 'securityDefinitions.0');
        if (_.get(methodInfo.securityDefinitions, '0.type') === VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.OAUTH2
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
            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, errMsg, xhrObj);
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
        let newDataSet;

        response = getValidJSON(response) || xmlToJson(response) || response;

        // EVENT: ON_RESULT
        initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response, options.xhrObj);

        /* if dataTransformation enabled, transform the data */
        if (variable.transformationColumns) {
            response = this.transformData(response, variable);
        }

        // EVENT: ON_PREPARE_SETDATA
        newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, response, options.xhrObj);
        if (isDefined(newDataSet)) {
            // setting newDataSet as the response to service variable onPrepareSetData
            response = newDataSet;
        }

        newDataSet = (!_.isObject(response)) ? {'value': response} : response;

        /* update the dataset against the variable, if response is non-object, insert the response in 'value' field of dataSet */
        if (!options.forceRunMode && !options.skipDataSetUpdate) {
            variable.dataSet = newDataSet;
        }

        /* trigger success callback */
        triggerFn(success, response);

        setTimeout(() => {
            // EVENT: ON_SUCCESS
            initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, response, options.xhrObj);

            if (!CONSTANTS.isStudioMode) {
                /* process next requests in the queue */
                variable.canUpdate = true;
                $queue.process(variable);
            }

            // EVENT: ON_CAN_UPDATE
            initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, response, options.xhrObj);
        });

        return variable.dataSet;
    }

    private uploadFileInFormData(variable: ServiceVariable, options: any, success: Function, error: Function, file, requestParams, fileCount) {
        const promise = upload(file, {
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
                } else {
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, this.fileUploadResponse);
                    this.fileUploadResponse = [];
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
     * Handles error, when variable's metadata is not found. The reason for this can be:
     *  - API is secure and user is not logged in
     *  - API is secure and user is logged in but not authorized
     *  - The servicedefs are not generated properly at the back end (need to edit the variable and re-run the project)
     * @param info
     * @param variable
     * @param errorCB
     * @param options
     */
    private handleRequestMetaError(info, variable, errorCB, options) {
        if (info.error.type === VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.NO_ACCESSTOKEN) {
            performAuthorization(undefined, info.securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY], this.invoke.bind(undefined, variable, options, null, errorCB), null);
            this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, true, true);
            return;
        }
        if (info.error.message) {
            console.warn(info.error.message);
            this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
            return;
        }
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
            dataArray = data[variable.dataField] || [],
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
        const methodInfo = _.get(metadataService.getByOperationId(variable.operationId), 'wmServiceOperationInfo');
        if (!methodInfo) {
            return {};
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
                        param.sampleValue = options.page || param.sampleValue;
                    } else if (param.name === 'sort') {
                        param.sampleValue = getEvaluatedOrderBy(variable.orderBy, options.orderBy) || param.sampleValue;
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
                    if (input instanceof File) {
                        fileArr.push(input);
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
        const inputFields = getClonedObject(options.inputFields || variable.dataBinding),
            operationInfo = this.getMethodInfo(variable, inputFields, options),
            requestParams = ServiceVariableUtils.constructRequestParams(variable, operationInfo, inputFields);

        // check errors
        if (requestParams.error) {
            this.handleRequestMetaError(requestParams, variable, error, options);
            return;
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
        this.notifyInflight(variable,true);

        // make the call
        return this.makeCall(requestParams).then((response) => {
            const data = this.processSuccessResponse(response.body, variable, options, success);
            // notify variable success
            this.notifyInflight(variable,false, data);
            initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, variable.dataSet);
            return Promise.resolve(data);
        }, (e) => {
            // notify variable error
            this.notifyInflight(variable,false);
            this.processErrorResponse(variable, e, error, options.xhrObj, options.skipNotification);
        });
    }

    // *********************************************************** PUBLIC ***********************************************************//

    public invoke(variable, options, success, error) {
        options = options || {};
        options.inputFields = options.inputFields || getClonedObject(variable.dataBinding);
        return $queue.submit(variable).then(this._invoke.bind(this, variable, options, success, error), error);
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

    /**
     * This method returns filtered records based on searchKey and queryText.
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}
     */
    public searchRecords(variable, options, success, error) {
        const searchKeys = options.searchKeys,
            searchValue = options.searchValue;

        _.forEach(searchKeys, key => {
           this.setInput(variable, key, searchValue, options);
        });

        const requestParams = {
            page: options.page,
            skipDataSetUpdate: true, // dont update the actual variable dataset,
            skipToggleState: true, // Dont change the varibale toggle state as this is a independent call
            inFlightBehavior: 'executeAll',
        };

        return this.invoke(variable, requestParams, success, error);
    }
}