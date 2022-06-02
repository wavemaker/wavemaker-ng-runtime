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
// import { $invokeWatchers, getClonedObject, getValidJSON, isDefined, isPageable, isValidWebURL, noop, triggerFn, xmlToJson } from '@wm/core';
import { getClonedObject, triggerFn } from "../../util/utils";
import { ServiceVariableUtils } from '../../util/variable/service-variable.utils';
import { $queue } from '../../util/inflight-queue';
import { VARIABLE_CONSTANTS, WS_CONSTANTS } from '../../constants/variables.constants';
import { appManager, setInput } from './../../util/variable/variables.utils';
import { getEvaluatedOrderBy, initiateCallback, metadataService } from '../../util/variable/variables.utils';
import { getAccessToken } from '../../util/oAuth.utils';
import { ServiceVariableManager } from './service-variable.manager';
var CrudVariableManager = /** @class */ (function (_super) {
    __extends(CrudVariableManager, _super);
    function CrudVariableManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fileUploadResponse = [];
        _this.fileUploadCount = 0;
        _this.totalFilesCount = 0;
        _this.successFileUploadCount = 0;
        _this.failedFileUploadCount = 0;
        return _this;
    }
    CrudVariableManager.prototype.getPaginationInfo = function (variable, inputFields, options) {
        if (!options || !options.operation) {
            options.operation = 'list';
        }
        var serviceDef = getClonedObject(metadataService.getByCrudId(variable.crudOperationId, variable.getPrefabName()));
        var methodInfo = serviceDef === null ? null : _.get(serviceDef, 'wmServiceOperationInfo');
        methodInfo = serviceDef.filter(function (item) {
            return options.operation === item.operationType;
        })[0];
        if (!methodInfo) {
            return methodInfo;
        }
        // methodInfo.paginationInfo = {
        //                                 "contentMapping": "content",
        //                                 "ascSortExpression": "{{fieldName}} a",
        //                                 "descSortExpression": "{{fieldName}} d",
        //                                 //"defaultSortExpression": "id",
        //                                 "totalMapping": "totalElements",
        //                                 "pageMapping": {
        //                                     "in": "query",
        //                                     "name": "pageNum",
        //                                     "description": "the existing id",
        //                                     "type": "integer",
        //                                     "required": true
        //                                 },
        //                                 "sizeMapping": {
        //                                     "in": "query",
        //                                     "name": "limit",
        //                                     "description": "the existing id",
        //                                     "type": "integer",
        //                                     "required": true
        //                                 },
        //                                 "sortMapping": {
        //                                     "name": "sortInfo",
        //                                     "in": "query",
        //                                     "description": "the sorting criteria",
        //                                     "required": true,
        //                                     "type": "integer"
        //                                 }
        //                             };
        methodInfo.paginationInfo = null;
        return methodInfo.paginationInfo;
    };
    CrudVariableManager.prototype.getOperationInfo = function (variable, options) {
        var serviceDef = getClonedObject(metadataService.getByCrudId(variable.crudOperationId, variable.getPrefabName()));
        var methodInfo;
        // fallback if there is no operation
        if (options && !options.operation) {
            options.operation = 'list';
        }
        if (!serviceDef.length) {
            return;
        }
        methodInfo = serviceDef.filter(function (item) {
            return options.operation === item.operationType;
        })[0];
        return methodInfo ? methodInfo.wmServiceOperationInfo : { invalid: true };
    };
    /**
     * gets the service operation info against a service variable
     * this is extracted from the metadataservice
     * @param variable
     * @param inputFields: sample values, if provided, will be set against params in the definition
     * @param options
     * @returns {any}
     */
    CrudVariableManager.prototype.getMethodInfoForCrud = function (variable, inputFields, options) {
        var methodInfo = this.getOperationInfo(variable, options);
        if (!methodInfo || methodInfo.invalid) {
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
    CrudVariableManager.prototype._invoke = function (variable, options, success, error) {
        var _this = this;
        var inputFields = getClonedObject(options.inputFields || {});
        if (options.operation === 'delete') {
            inputFields = getClonedObject(options.row || inputFields.row || options.inputFields || variable.dataBinding);
        }
        else if (options.operation === 'create' && options.row) {
            inputFields = getClonedObject(options.row);
        }
        else if (options.operation === 'update' && options.row) {
            inputFields = getClonedObject(options.row);
        }
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
        var opInfo = this.getOperationInfo(variable, options);
        var bodyParam;
        if (opInfo && opInfo.parameters) {
            bodyParam = opInfo.parameters.filter(function (op) {
                return op.parameterType === 'body' || op.parameterType === 'formData';
            })[0];
        }
        // merge fields with bindings
        var bindingFields = _.get(variable.dataBinding, options.operation) || {};
        // bindings from setInput can come along with the body param, so employee.age will have to be converted to age
        if (bodyParam && bindingFields[bodyParam.name]) {
            _.forEach(bindingFields, function (bindingFieldVal, bindingFieldKey) {
                if (bindingFieldKey === bodyParam.name) {
                    _.merge(inputFields, bindingFieldVal);
                }
                else {
                    inputFields[bindingFieldKey] = bindingFieldVal;
                }
            });
        }
        else {
            _.merge(inputFields, bindingFields);
        }
        if ((options.operation === 'create' || options.operation === 'update') && (!bodyParam || !inputFields[bodyParam.name])) {
            var bodyTypeKeys = [], nonBodyParam = void 0;
            var _loop_1 = function (fieldName) {
                nonBodyParam = opInfo.parameters.filter(function (param) {
                    return param.name === fieldName && param.parameterType !== 'body' && param.parameterType !== 'formData';
                });
                if (nonBodyParam.length) {
                    bodyTypeKeys.push(fieldName);
                }
            };
            // only merge body/formData type params to the requestBody.
            for (var fieldName in inputFields) {
                _loop_1(fieldName);
            }
            var reqBodyFields = _.omit(inputFields, bodyTypeKeys);
            if (bodyParam) {
                inputFields[bodyParam.name] = getClonedObject(reqBodyFields);
            }
            else {
                inputFields.RequestBody = getClonedObject(reqBodyFields);
            }
        }
        var paginationInfo;
        var operationInfo = this.getMethodInfoForCrud(variable, inputFields, options);
        var pathParam, bodyTypeParam;
        if (!variable.paginationTransformationRequired && operationInfo && !operationInfo.invalid) {
            if (operationInfo.parameters) {
                operationInfo.parameters.forEach(function (parameter) {
                    if (parameter.parameterType === 'path') {
                        pathParam = parameter.name;
                    }
                    else if (parameter.parameterType === 'body') {
                        bodyTypeParam = parameter.name;
                        inputFields[bodyTypeParam] = getClonedObject(inputFields);
                    }
                });
            }
            for (var key in inputFields) {
                if (key !== bodyTypeParam) {
                    delete inputFields[key];
                }
            }
            if (pathParam && inputFields[bodyTypeParam]) {
                inputFields[pathParam] = getClonedObject(inputFields[bodyTypeParam][pathParam]);
            }
        }
        // else {
        //     inputFields.totalMapping = paginationInfo && paginationInfo.totalMapping;
        // }
        var requestParams = ServiceVariableUtils.constructRequestParams(variable, operationInfo, inputFields);
        inputFields.sortInfo = options.orderBy;
        // check errors
        if (requestParams.error) {
            if (requestParams.error.type === VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.CRUD_OPERATION_MISSING) {
                requestParams.error.message = requestParams.error.message.replace('$operation', options.operation);
            }
            if (options.preventMissingOpMsg) {
                $queue.process(variable);
                return Promise.resolve('');
            }
            var info = this.handleRequestMetaError(requestParams, variable, success, error, options);
            var reason = (_.get(info, 'error.message') || 'An error occurred while triggering the variable');
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
        successHandler = function (response, resolve, inputObj) {
            if (response && response.type) {
                if (variable.paginationTransformationRequired) {
                    var json = JSON.parse(response.body);
                    var pageable = {
                        'content': json[paginationInfo.contentMapping],
                        'first': inputObj[paginationInfo.pageMapping.name] === 1 ? true : false,
                        'last': inputObj[paginationInfo.pageMapping.name] === json[inputFields.totalMapping] ? true : false,
                        'number': inputObj[paginationInfo.pageMapping.name] - 1,
                        'numberOfElements': inputObj[paginationInfo.sizeMapping.name],
                        'size': inputObj[paginationInfo.sizeMapping.name],
                        'sort': null,
                        'totalElements': json[inputFields.totalMapping],
                        'totalPages': Math.ceil(json[inputFields.totalMapping] / inputObj[paginationInfo.sizeMapping.name])
                    };
                    if (inputObj.sortInfo) {
                        pageable.sort = [{ direction: inputObj.sortInfo.split(' ')[1].toUpperCase(), property: inputObj.sortInfo.split(' ')[0], ignoreCase: false, nullHandling: "NATIVE", ascending: inputObj.sortInfo.split(' ')[1] === 'asc' ? true : false }];
                    }
                    json = getClonedObject(pageable);
                    response.body = JSON.stringify(json);
                }
                var data = _this.processSuccessResponse(response.body, variable, _.extend(options, { 'xhrObj': response }), success, response.headers, operationInfo);
                // notify variable success
                _this.notifyInflight(variable, false, data);
                resolve(response);
            }
        };
        errorHandler = function (err, reject) {
            var errMsg = variable.httpService.getErrMessage(err);
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
            _this.httpCall(requestParams, variable).then(function (response) {
                successHandler(response, resolve, inputFields);
            }, function (err) {
                errorHandler(err, reject);
            });
            // the _observable property on variable is used store the observable using which the network call is made
            // this can be used to cancel the variable calls.
        });
    };
    // *********************************************************** PUBLIC ***********************************************************//
    CrudVariableManager.prototype.invoke = function (variable, options, success, error) {
        options = options || {};
        appManager.notify('check-state-persistence-options', {
            options: options,
            variable: variable
        });
        options.operation = options.operation || 'list';
        options.inputFields = options.inputFields || getClonedObject(variable.dataBinding[options.operation]);
        return $queue.submit(variable).then(this._invoke.bind(this, variable, options, success, error), error);
    };
    CrudVariableManager.prototype.getInputParms = function (variable) {
        var wmServiceOperationInfo = _.get(metadataService.getByOperationId(variable.operationId, variable.getPrefabName()), 'wmServiceOperationInfo');
        return _.get(wmServiceOperationInfo, 'parameters');
    };
    CrudVariableManager.prototype.setInput = function (variable, key, val, options, type) {
        type = type || 'list';
        if (_.isEmpty(variable.dataBinding[type])) {
            variable.dataBinding[type] = {};
        }
        return setInput(variable.dataBinding[type], key, val, options);
    };
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
    CrudVariableManager.prototype.initBinding = function (variable) {
        var crudBindInfo = variable.dataBinding || {}, flattenedBindInfo = [];
        _.forEach(crudBindInfo, function (bindNodes, operationType) {
            bindNodes = bindNodes || [];
            bindNodes.forEach(function (bindNode) {
                bindNode.target = operationType + '.' + bindNode.target;
                flattenedBindInfo.push(bindNode);
            });
        });
        variable.dataBinding = flattenedBindInfo;
        _super.prototype.initBinding.call(this, variable);
    };
    return CrudVariableManager;
}(ServiceVariableManager));
export { CrudVariableManager };
//# sourceMappingURL=crud-variable.manager.js.map