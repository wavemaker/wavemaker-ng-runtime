var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { getClonedObject, getValidJSON, isDefined, isPageable, isValidWebURL, triggerFn, noop, xmlToJson } from "../../util/utils";
import { upload } from '../../util/file-upload.util';
import { ServiceVariableUtils } from '../../util/variable/service-variable.utils';
import { $queue } from '../../util/inflight-queue';
import { BaseVariableManager } from './base-variable.manager';
import { CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS } from '../../constants/variables.constants';
import { appManager, formatExportExpression, setInput, decodeData, metadataService, getErrMessage } from './../../util/variable/variables.utils';
import { getEvaluatedOrderBy, initiateCallback, securityService } from '../../util/variable/variables.utils';
import { getAccessToken, performAuthorization, removeAccessToken } from '../../util/oAuth.utils';
import { PaginationUtils } from '../../util/variable/pagination.utils';
import { VariableEvents } from "../../model/base-variable";
import _ from "lodash";
var ServiceVariableManager = /** @class */ (function (_super) {
    __extends(ServiceVariableManager, _super);
    function ServiceVariableManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fileUploadResponse = [];
        _this.fileUploadCount = 0;
        _this.totalFilesCount = 0;
        _this.successFileUploadCount = 0;
        _this.failedFileUploadCount = 0;
        return _this;
    }
    /**
     * function to process error response from a service
     * @param {ServiceVariable} variable
     * @param {string} errMsg
     * @param {Function} errorCB
     * @param xhrObj
     * @param {boolean} skipNotification
     * @param {boolean} skipDefaultNotification
     */
    ServiceVariableManager.prototype.processErrorResponse = function (variable, errMsg, errorCB, xhrObj, skipNotification, skipDefaultNotification) {
        var methodInfo = this.getMethodInfo(variable, {}, {});
        var securityDefnObj = _.get(methodInfo, 'securityDefinitions.0');
        var advancedOptions = this.prepareCallbackOptions(xhrObj);
        // EVENT: ON_ERROR
        if (!skipNotification) {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, errMsg, advancedOptions, skipDefaultNotification);
        }
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
    };
    /**
     * function to process success response from a service
     * @param response
     * @param variable
     * @param options
     * @param success
     */
    ServiceVariableManager.prototype.processSuccessResponse = function (response, variable, options, success, resHeaders, operationInf) {
        var dataSet;
        var newDataSet;
        var pagination = {};
        var advancedOptions;
        var jsonParsedResponse = getValidJSON(response);
        response = isDefined(jsonParsedResponse) ? jsonParsedResponse : (xmlToJson(response) || response);
        var isResponsePageable = isPageable(response);
        if (variable.serviceType === 'DataService' || variable.serviceType === 'JavaService') {
            var decodedData = decodeData(response);
            if (_.isString(response)) {
                response = decodedData;
            }
        }
        if (isResponsePageable) {
            dataSet = response.content;
            pagination = _.omit(response, 'content');
        }
        else {
            dataSet = response;
        }
        /**
         * send pagination object with advancedOptions all the time.
         * With this, user can provide pagination option, even if it is not there.
         * applicable to 3rd party services that do not support pagination out of the box.
         */
        advancedOptions = this.prepareCallbackOptions(options.xhrObj, { pagination: pagination, rawData: dataSet });
        // EVENT: ON_RESULT
        initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response, advancedOptions);
        // trigger success callback, pass data received from server as it is.
        triggerFn(success, response, pagination);
        /* if dataTransformation enabled, transform the data */
        if (variable.transformationColumns) {
            this.transformData(response, variable);
        }
        // if a primitive type response is returned, wrap it in an object
        dataSet = (!_.isObject(dataSet)) ? { 'value': dataSet } : dataSet;
        // EVENT: ON_PREPARE_SETDATA
        newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, dataSet, advancedOptions);
        if (isDefined(newDataSet)) {
            // setting newDataSet as the response to service variable onPrepareSetData
            dataSet = newDataSet;
        }
        var inputFields = getClonedObject(options.inputFields || variable.dataBinding);
        // WMS-22361 : For crud variable, apply operation info recived else deduce for service variables
        var operationInfo = operationInf ? operationInf : this.getMethodInfo(variable, inputFields, options);
        var paginationInfo = PaginationUtils.getPaginationInfo(operationInfo, variable);
        if (paginationInfo) {
            var res = PaginationUtils.generatePaginationRes(operationInfo, paginationInfo, response, resHeaders, options, variable);
            if (!_.isEmpty(res)) {
                PaginationUtils.setVariablePagination(variable, res, options);
            }
        }
        /* update the dataset against the variable, if response is non-object, insert the response in 'value' field of dataSet */
        if (!options.forceRunMode && !options.skipDataSetUpdate) {
            if (!variable._paginationConfig) {
                variable.pagination = pagination;
            }
            variable.dataSet = dataSet;
            // legacy properties in dataSet, [content]
            if (isResponsePageable) {
                Object.defineProperty(variable.dataSet, 'content', {
                    get: function () {
                        return variable.dataSet;
                    }
                });
            }
        }
        variable.notify(VariableEvents.AFTER_INVOKE, [this, dataSet]);
        setTimeout(function () {
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
    };
    ServiceVariableManager.prototype.uploadFileInFormData = function (variable, options, success, error, file, requestParams) {
        var _this = this;
        var promise = upload(file, variable, requestParams.data, {
            fileParamName: 'files',
            url: requestParams.url
        });
        promise.then(function (data) {
            _this.fileUploadCount++;
            _this.successFileUploadCount++;
            _this.fileUploadResponse.push(data[0]);
            if (_this.totalFilesCount === _this.fileUploadCount) {
                if (_this.failedFileUploadCount === 0) {
                    _this.processSuccessResponse(_this.fileUploadResponse, variable, options, success);
                    _this.fileUploadResponse = [];
                    if (!variable.onSuccess) {
                        appManager && appManager.notifyApp(appManager.getAppLocale().MESSAGE_FILE_UPLOAD_SUCCESS, 'success');
                    }
                }
                else {
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, _this.fileUploadResponse);
                    _this.fileUploadResponse = [];
                    appManager && appManager.notifyApp(appManager.getAppLocale().MESSAGE_FILE_UPLOAD_ERROR, 'error');
                }
                _this.fileUploadCount = 0;
                _this.successFileUploadCount = 0;
                _this.totalFilesCount = 0;
            }
            return data;
        }, function (e) {
            _this.fileUploadCount++;
            _this.failedFileUploadCount++;
            _this.fileUploadResponse.push(e);
            var errMsg = getErrMessage(e, variable.httpService.getLocale());
            // if a file upload failed, notify the progress listener to take action
            if (variable._progressObservable) {
                variable._progressObservable.next({
                    'status': "error",
                    'fileName': file.name,
                    'errMsg': errMsg
                });
            }
            if (_this.totalFilesCount === _this.fileUploadCount) {
                _this.processErrorResponse(variable, errMsg, error, e, options.skipNotification);
                _this.fileUploadResponse = [];
                _this.fileUploadCount = 0;
                _this.failedFileUploadCount = 0;
                _this.totalFilesCount = 0;
            }
            return e;
        }, function (data) {
            if (variable._progressObservable) {
                variable._progressObservable.next({
                    'progress': data,
                    'status': VARIABLE_CONSTANTS.EVENT.PROGRESS,
                    'fileName': file.name
                });
            }
            initiateCallback(VARIABLE_CONSTANTS.EVENT.PROGRESS, variable, data);
            return data;
        });
        return promise;
    };
    /**
     * Checks if the user is logged in or not and returns appropriate error
     * If user is not logged in, Session timeout logic is run, for user to login
     * @param variable
     * @returns {any}
     */
    ServiceVariableManager.prototype.handleAuthError = function (variable, success, errorCB, options) {
        var isUserAuthenticated = _.get(securityService.get(), 'authenticated');
        var info;
        if (isUserAuthenticated) {
            info = {
                error: {
                    message: 'You\'re not authorised to access the resource "' + variable.service + '".'
                }
            };
        }
        else {
            info = {
                error: {
                    message: 'You\'re not authenticated to access the resource "' + variable.service + '".',
                    skipDefaultNotification: true
                }
            };
            appManager.pushToSessionFailureRequests(variable.invoke.bind(variable, options, success, errorCB));
            appManager.handle401();
        }
        console.warn(variable.name + ': ' + info.error.message);
        return info;
    };
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
    ServiceVariableManager.prototype.handleRequestMetaError = function (info, variable, success, errorCB, options) {
        var err_type = _.get(info, 'error.type');
        switch (err_type) {
            case VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.NO_ACCESSTOKEN:
                performAuthorization(undefined, info.securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY], this.invoke.bind(this, variable, options, success, errorCB), null, this.getProviderInfo(variable, info.securityDefnObj['x-WM-PROVIDER_ID']));
                this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, true, true);
                break;
            case VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.USER_UNAUTHORISED:
                info = this.handleAuthError(variable, success, errorCB, options);
                this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
                break;
            case VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.METADATA_MISSING:
            case VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.CRUD_OPERATION_MISSING:
                if (info.error.message) {
                    info.error.message = info.error.message.replace('$variable', variable.name);
                    var reasons = void 0;
                    if (err_type === VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.METADATA_MISSING) {
                        reasons = ['1. You did not Preview the app after creating a Variable for the imported service.', '2. You deleted the imported service this Variable is linked to.'];
                    }
                    else {
                        reasons = ['1. You haven\'t chosen an endpoint for ' + options.operation + ' operation for this Entity.'];
                    }
                    console.warn(info.error.message + '\n Possible reasons for this:\n ' + reasons.join('\n '));
                }
                this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
                break;
            default:
                if (info.error.message) {
                    console.warn(info.error.message, variable.name);
                    this.processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
                }
        }
        return info;
    };
    /**
     * function to transform the service data as according to the variable configuration
     * this is used when 'transformationColumns' property is set on the variable
     * @param data: data returned from the service
     * @variable: variable object triggering the service
     */
    ServiceVariableManager.prototype.transformData = function (data, variable) {
        data.wmTransformedData = [];
        var columnsArray = variable.transformationColumns, dataArray = _.get(data, variable.dataField) || [], transformedData = data.wmTransformedData;
        _.forEach(dataArray, function (datum, index) {
            transformedData[index] = {};
            _.forEach(columnsArray, function (column, columnIndex) {
                transformedData[index][column] = datum[columnIndex];
            });
        });
    };
    /**
     * gets the service operation info against a service variable
     * this is extracted from the metadataservice
     * @param variable
     * @param inputFields: sample values, if provided, will be set against params in the definition
     * @param options
     * @returns {any}
     */
    ServiceVariableManager.prototype.getMethodInfo = function (variable, inputFields, options) {
        var methodInfo;
        if (!_.isEmpty(metadataService)) {
            var serviceDef = getClonedObject(metadataService.getByOperationId(variable.operationId, variable.getPrefabName()));
            methodInfo = serviceDef === null ? null : _.get(serviceDef, 'wmServiceOperationInfo');
        }
        else {
            methodInfo = variable.serviceInfo;
        }
        if (!methodInfo) {
            return methodInfo;
        }
        var securityDefnObj = _.get(methodInfo.securityDefinitions, '0'), isOAuthTypeService = securityDefnObj && (securityDefnObj.type === VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.OAUTH2);
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
                    }
                    else if (param.name === 'page') {
                        param.sampleValue = options.page || param.sampleValue || 1;
                    }
                    else if (param.name === 'sort') {
                        param.sampleValue = getEvaluatedOrderBy(variable.orderBy, options.orderBy) || param.sampleValue || '';
                    }
                }
                else if (param.name === 'access_token' && isOAuthTypeService) {
                    param.sampleValue = getAccessToken(securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY], null);
                }
            });
        }
        return methodInfo;
    };
    /**
     * gets the provider info against a service variable's provider
     * this is extracted from the metadataservice
     * @param variable
     * @param providerId
     * @returns {any}
     */
    ServiceVariableManager.prototype.getProviderInfo = function (variable, providerId) {
        return getClonedObject(metadataService === null || metadataService === void 0 ? void 0 : metadataService.getByProviderId(providerId, variable.getPrefabName()));
    };
    /**
     * Returns true if any of the files are in onProgress state
     */
    ServiceVariableManager.prototype.isFileUploadInProgress = function (dataBindings) {
        var filesStatus = false;
        _.forEach(dataBindings, function (dataBinding) {
            if (_.isArray(dataBinding) && dataBinding[0] instanceof File) {
                _.forEach(dataBinding, function (file) {
                    if (file.status === 'onProgress') {
                        filesStatus = true;
                        return;
                    }
                });
            }
        });
        return filesStatus;
    };
    // Makes the call for Uploading file/ files
    ServiceVariableManager.prototype.uploadFile = function (variable, options, success, error, inputFields, requestParams) {
        var _this = this;
        var fileParamCount = 0;
        var fileArr = [], promArr = [];
        _.forEach(inputFields, function (inputField) {
            if (_.isArray(inputField)) {
                if (inputField[0] instanceof File) {
                    fileParamCount++;
                }
                _.forEach(inputField, function (input) {
                    if (input instanceof File || _.find(_.values(input), function (o) { return o instanceof Blob; })) {
                        fileArr.push(input);
                        _this.totalFilesCount++;
                        fileParamCount = fileParamCount || 1;
                    }
                });
            }
            else {
                if (inputField instanceof File) {
                    fileParamCount++;
                    _this.totalFilesCount++;
                    fileArr.push(inputField);
                }
            }
        });
        if (fileParamCount === 1) {
            if (inputFields.files.length > 1) {
                _.forEach(fileArr, function (file) {
                    promArr.push(_this.uploadFileInFormData(variable, options, success, error, file, requestParams));
                });
                return Promise.all(promArr);
            }
            else {
                return this.uploadFileInFormData(variable, options, success, error, fileArr[0], requestParams);
            }
        }
    };
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
    ServiceVariableManager.prototype._invoke = function (variable, options, success, error) {
        var _this = this;
        var inputFields = getClonedObject(options.inputFields || variable.dataBinding);
        // EVENT: ON_BEFORE_UPDATE
        var output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, inputFields, options);
        var successHandler;
        var errorHandler;
        if (output === false) {
            $queue.process(variable);
            triggerFn(error);
            return;
        }
        if (_.isObject(output)) {
            inputFields = output;
        }
        var operationInfo = this.getMethodInfo(variable, inputFields, options);
        var requestParams = ServiceVariableUtils.constructRequestParams(variable, operationInfo, inputFields, options);
        // check errors
        if (requestParams.error) {
            var info = this.handleRequestMetaError(requestParams, variable, success, error, options);
            var reason = (_.get(info, 'error.message') || 'An error occurred while triggering the variable: ') + ': ' + variable.name;
            triggerFn(error);
            return Promise.reject(reason);
        }
        // file upload
        if (ServiceVariableUtils.isFileUploadRequest(variable)) {
            var uploadPromise = this.uploadFile(variable, options, success, error, inputFields, requestParams);
            if (uploadPromise) {
                return uploadPromise;
            }
        }
        // file download
        if (operationInfo && _.isArray(operationInfo.produces) && _.includes(operationInfo.produces, WS_CONSTANTS.CONTENT_TYPES.OCTET_STREAM)) {
            // ToDo - variable seperation
            return variable.simulateFileDownload(requestParams, variable.dataBinding.file || variable.name, variable.dataBinding.exportType, function () {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, null, null, null);
                $queue.process(variable);
                triggerFn(success);
            }, function () {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null, null, null);
                $queue.process(variable);
                triggerFn(error);
            });
        }
        // notify variable progress
        this.notifyInflight(variable, !options.skipToggleState);
        successHandler = function (response, resolve) {
            if (response && response.type || response && response.status) {
                var res = response.body || response.data;
                var data = _this.processSuccessResponse(res, variable, _.extend(options, { 'xhrObj': response }), success, response.headers);
                // notify variable success
                _this.notifyInflight(variable, false, data);
                resolve(response);
            }
        };
        errorHandler = function (err, reject) {
            var errMsg = getErrMessage(err, variable.httpService.getLocale());
            // notify variable error
            _this.notifyInflight(variable, false);
            _this.processErrorResponse(variable, errMsg, error, err, options.skipNotification);
            reject({
                error: errMsg,
                details: err
            });
        };
        // make the call and return a promise to the user to support script calls made by users
        return new Promise(function (resolve, reject) {
            requestParams.responseType = 'text'; // this is to return text response. JSON & XML-to-JSON parsing is handled in success handler.
            // ToDo - variable seperation
            // this.httpCall(requestParams, variable).then((response) => {
            //     successHandler(response, resolve);
            // }, err => {
            //     const validJSON = getValidJSON(err.error);
            //     err.error = isDefined(validJSON) ? validJSON : err.error;
            //     errorHandler(err, reject);
            // });
            // the _observable property on variable is used store the observable using which the network call is made
            // this can be used to cancel the variable calls.
            variable.httpService.sendCall(requestParams, variable).then(function (response) {
                successHandler(response, resolve);
            }, function (err) {
                var validJSON = getValidJSON(err.error);
                err.error = isDefined(validJSON) ? validJSON : err.error;
                errorHandler(err, reject);
            });
        });
    };
    // *********************************************************** PUBLIC ***********************************************************//
    ServiceVariableManager.prototype.invoke = function (variable, options, success, error) {
        options = options || {};
        // appManager.notify('check-state-persistence-options', {
        //     options: options,
        //     variable: variable
        // });
        options.inputFields = options.inputFields || getClonedObject(variable.dataBinding);
        return $queue.submit(variable).then(this._invoke.bind(this, variable, options, success, error), error);
    };
    ServiceVariableManager.prototype.setPagination = function (variable, data) {
        variable._paginationConfig = data;
    };
    ServiceVariableManager.prototype.download = function (variable, options, successHandler, errorHandler) {
        options = options || {};
        var inputParams = getClonedObject(variable.dataBinding);
        var inputData = options.data || {};
        var methodInfo = this.getMethodInfo(variable, inputParams, options);
        var requestParams;
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
        return variable.httpService.send(requestParams).then(function (response) {
            if (response && isValidWebURL(response.body.result)) {
                window.location.href = response.body.result;
                triggerFn(successHandler, response);
            }
            else {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response);
                triggerFn(errorHandler, response);
            }
        }, function (response, xhrObj) {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response, xhrObj);
            triggerFn(errorHandler, response);
        });
    };
    ServiceVariableManager.prototype.getInputParms = function (variable) {
        var wmServiceOperationInfo;
        if (!_.isEmpty(metadataService)) {
            wmServiceOperationInfo = _.get(metadataService.getByOperationId(variable.operationId, variable.getPrefabName()), 'wmServiceOperationInfo');
        }
        else {
            wmServiceOperationInfo = variable.serviceInfo;
        }
        return _.get(wmServiceOperationInfo, 'parameters');
    };
    ServiceVariableManager.prototype.setInput = function (variable, key, val, options) {
        return setInput(variable.dataBinding, key, val, options);
    };
    /**
     * Cancels an on going service request
     * @param variable
     * @param $file
     */
    ServiceVariableManager.prototype.cancel = function (variable, $file) {
        // CHecks if there is any pending requests in the queue
        if ($queue.requestsQueue.has(variable)) {
            // If the request is a File upload request then modify the elements associated with file upload
            // else unsubscribe from the observable on the variable.
            if (ServiceVariableUtils.isFileUploadRequest(variable)) {
                variable.httpService.cancel(variable, $file);
                $file.status = 'abort';
                this.totalFilesCount--;
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ABORT, variable, $file);
                if (!this.isFileUploadInProgress(variable.dataBinding) && this.totalFilesCount === 0) {
                    $queue.process(variable);
                    // notify inflight variable
                    this.notifyInflight(variable, false);
                }
            }
            else {
                if (variable.httpService.cancel) {
                    variable.httpService.cancel(variable);
                    $queue.process(variable);
                    // notify inflight variable
                    this.notifyInflight(variable, false);
                }
            }
        }
    };
    ServiceVariableManager.prototype.defineFirstLastRecord = function (variable) {
        if (variable.isList) {
            Object.defineProperty(variable, 'firstRecord', {
                'configurable': true,
                'get': function () {
                    var dataSet = variable.dataSet;
                    // For procedure(v1) data doesn't come under content
                    return _.head(dataSet && dataSet.content) || _.head(dataSet) || {};
                }
            });
            Object.defineProperty(variable, 'lastRecord', {
                'configurable': true,
                'get': function () {
                    var dataSet = variable.dataSet;
                    // For procedure(v1) data doesn't come under content
                    return _.last(dataSet && dataSet.content) || _.last(dataSet) || {};
                }
            });
        }
    };
    // Gets the input params of the service variable and also add params from the searchKeys (filterfields)
    ServiceVariableManager.prototype.getQueryParams = function (filterFields, searchValue, variable) {
        var inputParams = this.getInputParms(variable);
        var queryParams = ServiceVariableUtils.excludePaginationParams(inputParams);
        var inputFields = {};
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
    };
    /**
     * This method returns filtered records based on searchKey and queryText.
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}
     */
    ServiceVariableManager.prototype.searchRecords = function (variable, options, success, error) {
        var inputFields = this.getQueryParams(_.split(options.searchKey, ','), options.query, variable);
        var requestParams = {
            page: options.page,
            pagesize: options.pagesize,
            skipDataSetUpdate: true,
            skipToggleState: true,
            inFlightBehavior: 'executeAll',
            inputFields: inputFields
        };
        if (options.onBeforeservicecall) {
            options.onBeforeservicecall(inputFields);
        }
        return this.invoke(variable, requestParams, success, error).catch(noop);
    };
    return ServiceVariableManager;
}(BaseVariableManager));
export { ServiceVariableManager };
//# sourceMappingURL=service-variable.manager.js.map