declare const _, window;
import { VARIABLE_CONSTANTS, WS_CONSTANTS, CONSTANTS, SWAGGER_CONSTANTS, $rootScope } from './../../constants/variables.constants';
import { httpService, metadataService, initiateCallback, isFileUploadSupported, getEvaluatedOrderBy, simulateFileDownload } from './../../utils/variables.utils';
import { $queue } from './../../utils/inflight-queue';
import { formatDate, isDateTimeType, extractType, getBlob, getClonedObject, findValueOf, triggerFn } from '@utils/utils';

const isBodyTypeQueryOrProcedure = (variable) => {
    return (_.includes(['QueryExecution', 'ProcedureExecution'], variable.controller)) && (_.includes(['put', 'post'], variable.operationType));
};

const isQueryServiceVar = (variable) => {
    return variable.controller === VARIABLE_CONSTANTS.CONTROLLER_TYPE.QUERY && variable.serviceType === VARIABLE_CONSTANTS.SERVICE_TYPE.DATA;
};

const getMethodInfo = (variable, inputFields, options) => {
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
                // TODO: oauthProviderService integration
                // param.sampleValue = oAuthProviderService.getAccessToken(securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY]);
                param.sampleValue = 'TEST_VAL' + securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY];
            }
        });
    }
    return methodInfo;
};

const getFormData = (formData, param, paramValue) => {
    const paramType = _.toLower(extractType(_.get(param, 'items.type') || param.type)),
        paramContentType = CONSTANTS.isStudioMode ? param['x-WM-CONTENT_TYPE'] : param.contentType;
    if (isFileUploadSupported()) {
        if ((paramType !== 'file') && (paramContentType === 'string' || !paramContentType)) {
            if (_.isObject(paramValue)) {
                paramValue = JSON.stringify(paramValue);
            }
            formData.append(param.name, paramValue);
        } else {
            if (_.isArray(paramValue) && paramType === 'file') {
                _.forEach(paramValue, function (fileObject) {
                    formData.append(param.name, getBlob(fileObject), fileObject.name);
                });
            } else {
                formData.append(param.name, getBlob(paramValue, paramContentType), paramValue && paramValue.name);
            }
        }
        return formData;
    }
};

/**
 * Goes though request headers, appends 'X-' to certain headers
 * these headers need not be processed at proxy server and should directly be passed to the server
 * e.g. Authorization, Cookie, etc.
 * @param headers
 * @returns {{}}
 */
export const cloakHeadersForProxy = (headers) => {
    const _headers = {},
        UNCLOAKED_HEADERS = VARIABLE_CONSTANTS.REST_SERVICE.UNCLOAKED_HEADERS,
        CLOAK_PREFIX = VARIABLE_CONSTANTS.REST_SERVICE.PREFIX.CLOAK_HEADER_KEY;
    _.forEach(headers, function (val, key) {
        if (_.includes(UNCLOAKED_HEADERS, key.toUpperCase())) {
            _headers[key] = val;
        } else {
            _headers[CLOAK_PREFIX + key] = val;
        }
    });

    return _headers;
};

const processRequestBody = (inputData, params) => {
    const requestBody = {},
        missingParams = [];
    let paramValue;
    _.forEach(params, function (param) {
        paramValue = _.get(inputData, param.name);
        if (!_.isUndefined(paramValue) && (paramValue !== '') && !param.readOnly) {
            // paramValue = isDateTimeType(param.type) ? formatDate(paramValue, param.type) : paramValue;
            // Construct ',' separated string if param is not array type but value is an array
            // if (_.isArray(paramValue) && _.toLower(Utils.extractType(param.type)) === 'string') {
            //     paramValue = _.join(paramValue, ',');
            // }
            requestBody[param.name] = paramValue;
        } else if (param.required) {
            missingParams.push(param.name || param.id);
        }
    });
    return {
        'requestBody': requestBody,
        'missingParams': missingParams
    };
};

const constructRequestParams = (variable, operationInfo, inputFields) => {
    variable = variable || {};
    const directPath = operationInfo.directPath || '',
        relativePath = operationInfo.basePath ? operationInfo.basePath + operationInfo.relativePath : operationInfo.relativePath,
        nonFileTypeParams = {},
        isBodyTypeQueryProcedure = isBodyTypeQueryOrProcedure(variable);
    let queryParams = '',
        bodyInfo,
        headers = {},
        requestBody,
        url,
        requiredParamMissing = [],
        target,
        pathParamRex,
        invokeParams,
        authDetails = null,
        uname,
        pswd,
        method,
        formData,
        isProxyCall,
        paramValueInfo,
        params,
        securityDefnObj,
        accessToken;

    function getFormDataObj() {
        if (formData) {
            return formData;
        }
        formData = new FormData();
        return formData;
    }

    securityDefnObj = _.get(operationInfo.securityDefinitions, '0');

    if (securityDefnObj) {
        switch (securityDefnObj.type) {
            case VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.OAUTH2:
                // TODO[VIBHU]: oAuthProviderService migration to be done.
                // accessToken = oAuthProviderService.getAccessToken(securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY]);
                accessToken = 'TEMP_ACCESS_TOKEN_' + securityDefnObj[VARIABLE_CONSTANTS.REST_SERVICE.OAUTH_PROVIDER_KEY];
                if (accessToken) {
                    headers[VARIABLE_CONSTANTS.REST_SERVICE.AUTH_HDR_KEY] = VARIABLE_CONSTANTS.REST_SERVICE.PREFIX.AUTH_HDR_VAL.OAUTH + ' ' + accessToken;
                } else {
                    return {
                        'error': {
                            'type' : VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.NO_ACCESSTOKEN
                        },
                        'securityDefnObj': securityDefnObj
                    };
                }
                break;
            case VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.BASIC:
                uname = inputFields['wm_auth_username'];
                pswd = inputFields['wm_auth_password'];
                if (uname && pswd) {
                    // TODO[VIBHU]: bas64 encoding alternative.
                    headers[VARIABLE_CONSTANTS.REST_SERVICE.AUTH_HDR_KEY] = VARIABLE_CONSTANTS.REST_SERVICE.PREFIX.AUTH_HDR_VAL.BASIC + ' ' + btoa(uname + ':' + pswd);
                    authDetails = {
                        'type': VARIABLE_CONSTANTS.REST_SERVICE.AUTH_TYPE.BASIC
                    };
                } else {
                    return {
                        'error': {
                            'type' : VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.NO_CREDENTIALS,
                            'message': VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.NO_CREDENTIALS
                        },
                        'securityDefnObj': securityDefnObj
                    };
                }
                break;
        }
    }
    operationInfo.proxySettings = operationInfo.proxySettings || {web: true, mobile: false};
    method = operationInfo.httpMethod || operationInfo.methodType;
    isProxyCall = (function () {
        if (CONSTANTS.hasCordova) {
            return operationInfo.proxySettings.mobile;
        }
        return operationInfo.proxySettings.web;
    }());
    url = isProxyCall ? relativePath : directPath;

    /* loop through all the parameters */
    _.forEach(operationInfo.parameters, function (param) {
        // Set params based on current workspace
        function setParamsOfChildNode() {
            if (inputFields) {
                paramValueInfo = inputFields;
                params = _.get(operationInfo, ['definitions', param.type]);
            } else {
                // For Api Designer
                paramValueInfo = paramValue || {};
                params = param.children;
            }
        }

        let paramValue = param.sampleValue;

        if ((!_.isUndefined(paramValue) && paramValue !== null && paramValue !== '') || (isBodyTypeQueryProcedure && param.type !== 'file')) {
            // Format dateTime params for dataService variables
            if (variable.serviceType === VARIABLE_CONSTANTS.SERVICE_TYPE.DATA && isDateTimeType(param.type)) {
                paramValue = formatDate(paramValue, param.type);
            }
            // Construct ',' separated string if param is not array type but value is an array
            if (_.isArray(paramValue) && _.toLower(extractType(param.type)) === 'string' && variable.serviceType === VARIABLE_CONSTANTS.SERVICE_TYPE.DATA) {
                paramValue = _.join(paramValue, ',');
            }
            switch (param.parameterType.toUpperCase()) {
                case 'QUERY':
                    // Ignore null valued query params for queryService variable
                    if (_.isNull(paramValue) && isQueryServiceVar(variable)) {
                        break;
                    }
                    if (!queryParams) {
                        queryParams = '?' + param.name + '=' + encodeURIComponent(paramValue);
                    } else {
                        queryParams += '&' + param.name + '=' + encodeURIComponent(paramValue);
                    }
                    break;
                case 'PATH':
                    /* replacing the path param based on the regular expression in the relative path */
                    pathParamRex = new RegExp('\\s*\\{\\s*' + param.name + '(:\\.\\+)?\\s*\\}\\s*');
                    url = url.replace(pathParamRex, paramValue);
                    break;
                case 'HEADER':
                    headers[param.name] = paramValue;
                    break;
                case 'BODY':
                    // For post/put query methods wrap the input
                    if (isBodyTypeQueryProcedure) {
                        setParamsOfChildNode();
                        bodyInfo = processRequestBody(paramValueInfo, params);
                        requestBody = bodyInfo.requestBody;
                        requiredParamMissing = _.concat(requiredParamMissing, bodyInfo.missingParams);
                    } else {
                        requestBody = paramValue;
                    }
                    break;
                case 'FORMDATA':
                    if (isBodyTypeQueryProcedure && param.name === SWAGGER_CONSTANTS.WM_DATA_JSON) {
                        setParamsOfChildNode();
                        // Process query/procedure formData non-file params params
                        bodyInfo = this.processRequestBody(paramValueInfo, params);
                        requestBody = getFormData(getFormDataObj(), param, bodyInfo.requestBody);
                        requiredParamMissing = _.concat(requiredParamMissing, bodyInfo.missingParams);
                    } else {
                        requestBody = getFormData(getFormDataObj(), param, paramValue);
                    }
                    break;
            }
        } else if (param.required) {
            requiredParamMissing.push(param.name || param.id);
        }
    });

    // if required param not found, return error
    if (requiredParamMissing.length) {
        return {
            'error': {
                'type': 'required_field_missing',
                'field': requiredParamMissing.join(','),
                'message': 'Required field(s) missing: "' + requiredParamMissing + '"',
                'skipDefaultNotification': true
            }
        };
    }

    // Setting appropriate content-Type for request accepting request body like POST, PUT, etc
    if (!_.includes(WS_CONSTANTS.NON_BODY_HTTP_METHODS, _.toUpper(method))) {
        /*Based on the formData browser will automatically set the content type to 'multipart/form-data' and webkit boundary*/
        if (operationInfo.consumes && (operationInfo.consumes[0] === WS_CONSTANTS.CONTENT_TYPES.MULTIPART_FORMDATA)) {
            headers['Content-Type'] = undefined;
        } else {
            headers['Content-Type'] = (operationInfo.consumes && operationInfo.consumes[0]) || 'application/json';
        }
    }

    // if the consumes has application/x-www-form-urlencoded and
    // if the http request of given method type can have body send the queryParams as Form Data
    if (_.includes(operationInfo.consumes, WS_CONSTANTS.CONTENT_TYPES.FORM_URL_ENCODED)
        && !_.includes(WS_CONSTANTS.NON_BODY_HTTP_METHODS, (method || '').toUpperCase())) {
        // remove the '?' at the start of the queryParams
        if (queryParams) {
            requestBody = (requestBody ? requestBody + '&' : '') + queryParams.substring(1);
        }
        headers['Content-Type'] = WS_CONSTANTS.CONTENT_TYPES.FORM_URL_ENCODED;
    } else {
        url += queryParams;
    }

    /*
     * for proxy calls:
     *  - cloak the proper headers (required only for REST services)
     *  - prepare complete url from relativeUrl
     */
    if (isProxyCall) {
        // avoiding cloakHeadersForProxy when the method is invoked from apidesigner.
         headers = variable.serviceType !== VARIABLE_CONSTANTS.SERVICE_TYPE.REST || operationInfo.skipCloakHeaders ? headers : cloakHeadersForProxy(headers);
        if (variable._prefabName && VARIABLE_CONSTANTS.REST_SUPPORTED_SERVICES.indexOf(variable.serviceType) !== -1) {
            /* if it is a prefab variable (used in a normal project), modify the url */
            url = '/prefabs/' + variable._prefabName + url;
            target = 'invokePrefabRestService';
        } else if (!variable._prefabName) {
            url = 'services' + url;
        }
        url = $rootScope.project.deployedUrl + url;
    }

    /*creating the params needed to invoke the service. url is generated from the relative path for the operation*/
    invokeParams = {
        'projectID': $rootScope.project.id,
        'url': url,
        'target': target,
        'method': method,
        'headers': headers,
        'data': requestBody,
        'authDetails': authDetails,
        'isDirectCall': !isProxyCall,
        'isExtURL': variable.serviceType === VARIABLE_CONSTANTS.SERVICE_TYPE.REST
    };

    return invokeParams;
};

const makeCall = (params) => {
    return httpService.send(params);
};

const processErrorResponse = (variable, errMsg, errorCB, xhrObj?, skipNotification?, skipDefaultNotification?) => {
    // EVENT: ON_ERROR
    if (!skipNotification) {
        initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, errMsg, xhrObj, skipDefaultNotification);
    }
    const methodInfo = getMethodInfo(variable, {}, {}),
        securityDefnObj = _.get(methodInfo, 'securityDefinitions.0');
    if (_.get(methodInfo.securityDefinitions, '0.type') === VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN.OAUTH2
        && _.includes([VARIABLE_CONSTANTS.HTTP_STATUS_CODE.UNAUTHORIZED, VARIABLE_CONSTANTS.HTTP_STATUS_CODE.FORBIDDEN], _.get(xhrObj, 'status'))) {
        // oAuthProviderService.removeAccessToken(securityDefnObj[OAUTH_PROVIDER_KEY]);
    }
    /* trigger error callback */
    triggerFn(errorCB, errMsg);

    if (!CONSTANTS.isStudioMode) {
        /* process next requests in the queue */
        variable.canUpdate = true;
        $queue.process(variable, invoke);

        // EVENT: ON_CAN_UPDATE
        initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, errMsg, xhrObj);
    }
};

const handleRequestMetaError = (info, variable, errorCB, options) => {
    if (info.error.type === VARIABLE_CONSTANTS.REST_SERVICE.ERR_TYPE.NO_ACCESSTOKEN) {
        // oAuthProviderService.performAuthorization(undefined, info.securityDefnObj[OAUTH_PROVIDER_KEY], getDataInRun.bind(undefined, variable, options, success, errorCB));
        processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, true, true);
        return;
    }
    if (info.error.message) {
        console.warn(info.error.message);
        processErrorResponse(variable, info.error.message, errorCB, options.xhrObj, options.skipNotification, info.error.skipDefaultNotification);
        return;
    }
};

export const invoke = (variable, options, success, error) => {
    options = options || {};
    $queue.has(variable, function () {
        options.inputFields = options.inputFields || getClonedObject(variable.dataBinding);
        $queue.push(variable, {options: options, success: success, error: error});
    }, function () {
        const inputFields = getClonedObject(options.inputFields || variable.dataBinding);
        const operationInfo = getMethodInfo(variable, inputFields, {});
        const requestParams = constructRequestParams(variable, operationInfo, inputFields);

        // check errors
        if (requestParams.error) {
            handleRequestMetaError(requestParams, variable, error, options);
            return;
        }
        if (operationInfo && _.isArray(operationInfo.produces) && _.includes(operationInfo.produces, WS_CONSTANTS.CONTENT_TYPES.OCTET_STREAM)) {
            return simulateFileDownload(requestParams, variable.dataBinding.file || variable.name, variable.dataBinding.exportType, function () {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, null, null, null);
                triggerFn(success);
            }, function () {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null, null, null);
                triggerFn(error);
            });
        }

        // make the call
        return makeCall(requestParams).then(function (response) {
            variable.dataSet = response.body;
            initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, variable.dataSet);
            $queue.process(variable, invoke);
        }, function (e) {
            processErrorResponse(variable, e, error, options.xhrObj, options.skipNotification);
        });
    });
};

export const setInput = (variable, key, val, options) => {
    let targetObj = variable.dataBinding,
        keys,
        lastKey,
        paramObj = {};
    if (_.isObject(options)) {
        switch (options.type) {
            case 'file':
                val = getBlob(val, options.contentType);
                break;
            case 'number':
                val = _.isNumber(val) ? val : parseInt(val, 10);
                break;
        }
    }
    if (_.isObject(key)) {
        paramObj = key;
    } else if (key.indexOf('.') > -1) {
        keys = key.split('.');
        lastKey = keys.pop();
        // Finding the object based on the key
        targetObj = findValueOf(targetObj, keys.join('.'), true);
        key = lastKey;
        paramObj[key] = val;
    } else {
        paramObj[key] = val;
    }

    _.forEach(paramObj, function (paramVal, paramKey) {
        targetObj[paramKey] = paramVal;
    });
    return variable.dataBinding;
};

export const clearData = (variable) => {
    variable.dataSet = {};
    return variable.dataSet;
};

export const cancel = (variable) => {
    /* process only if current variable is actually active */
    console.warn('Yet to be implemented');
};
