import { Injectable } from '@angular/core';
import { MetadataService } from '../metadata-service/metadata.service';
import { ServiceVariable } from './service-variable';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../http-service/http.service';
import { $parse } from '@utils/expression-parser';

declare const _;

@Injectable()
export class ServiceVariableService {
    metadataService;
    httpClient;
    httpService;

    constructor(metadataService: MetadataService, httpCLient: HttpClient, httpService: HttpService) {
        this.metadataService = metadataService;
        this.httpClient = httpCLient;
        this.httpService = httpService;
    }

    initiateCallback(type: string, variable: any, data) {
        // TODO: [Vibhu], check whether to support legacy event calling mechanism (ideally, it should have been migrated)
        const fn = $parse(variable[type]);
        fn(variable.scope, {$event: variable, $scope: data});
    }

    processRequestBody(inputData, params) {
        var requestBody = {},
            missingParams = [],
            paramValue;
        _.forEach(params, function (param) {
            paramValue = _.get(inputData, param.name);
            if (!_.isUndefined(paramValue) && (paramValue !== '') && !param.readOnly) {
                // paramValue = Utils.isDateTimeType(param.type) ? Utils.formatDate(paramValue, param.type) : paramValue;
                //Construct ',' separated string if param is not array type but value is an array
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
    }

    constructRequestParams(variable, operationInfo, inputFields) {

        variable = variable || {};
        const CONSTANTS = {
            hasCordova: false
        };
        const WS_CONSTANTS = {
            NON_BODY_HTTP_METHODS: ['GET', 'HEAD'],
            CONTENT_TYPES: {
                FORM_URL_ENCODED: 'application/x-www-form-urlencoded',
                MULTIPART_FORMDATA: 'multipart/form-data',
                OCTET_STREAM: 'application/octet-stream'
            }
        };
        const VARIABLE_CONSTANTS = {
            REST_SUPPORTED_SERVICES: ['JavaService', 'SoapService', 'FeedService', 'RestService', 'SecurityServiceType', 'DataService', 'WebSocketService']
        };
        let queryParams = '',
            directPath = operationInfo.directPath || '',
            relativePath = operationInfo.basePath ? operationInfo.basePath + operationInfo.relativePath : operationInfo.relativePath,
            bodyInfo,
            headers = {},
            requestBody,
            nonFileTypeParams = {},
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
            isBodyTypeQueryProcedure = false,// = ServiceFactory.isBodyTypeQueryProcedure(variable),
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

        // if (securityDefnObj && securityDefnObj.type === SECURITY_DEFINITIONS_TYPE_OAUTH) {
        //     accessToken = oAuthProviderService.getAccessToken(securityDefnObj[OAUTH_PROVIDER_KEY]);
        //     if (accessToken) {
        //         headers[AUTH_HDR_KEY] = 'Bearer ' + accessToken;
        //     } else {
        //         return {
        //             'error': {
        //                 'type' : ERR_TYPE_NO_ACCESSTOKEN
        //             },
        //             'securityDefnObj': securityDefnObj
        //         };
        //     }
        // }
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
                    //For Api Designer
                    paramValueInfo = paramValue || {};
                    params = param.children;
                }
            }

            var paramValue = param.sampleValue;

            if ((!_.isUndefined(paramValue) && paramValue !== null && paramValue !== '') || (isBodyTypeQueryProcedure && param.type !== 'file')) {
                //Format dateTime params for dataService variables
                // if (variable.serviceType === 'DataService' && Utils.isDateTimeType(param.type)) {
                //     paramValue = Utils.formatDate(paramValue, param.type);
                // }
                //Construct ',' separated string if param is not array type but value is an array
                // if (WM.isArray(paramValue) && _.toLower(Utils.extractType(param.type)) === 'string' && variable.serviceType === 'DataService') {
                //     paramValue = _.join(paramValue, ',');
                // }
                switch (param.parameterType.toUpperCase()) {
                    case 'QUERY':
                        //Ignore null valued query params for queryService variable
                        // if (_.isNull(paramValue) && isQueryServiceVar(variable)) {
                        //     break;
                        // }
                        if (!queryParams) {
                            queryParams = '?' + param.name + '=' + encodeURIComponent(paramValue);
                        } else {
                            queryParams += '&' + param.name + '=' + encodeURIComponent(paramValue);
                        }
                        break;
                    case 'AUTH':
                        // if (param.name === 'wm_auth_username') {
                        //     uname = paramValue;
                        // } else if (param.name === 'wm_auth_password') {
                        //     pswd = paramValue;
                        // }
                        // if (uname && pswd) {
                        //     headers[AUTH_HDR_KEY] = "Basic " + $base64.encode(uname + ':' + pswd);
                        //     authDetails = {
                        //         'type': AUTH_TYPE_BASIC
                        //     };
                        // }
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
                        //For post/put query methods wrap the input
                        if (isBodyTypeQueryProcedure) {
                            setParamsOfChildNode();
                            bodyInfo = this.processRequestBody(paramValueInfo, params);
                            requestBody = bodyInfo.requestBody;
                            requiredParamMissing = _.concat(requiredParamMissing, bodyInfo.missingParams);
                        } else {
                            requestBody = paramValue;
                        }
                        break;
                    case 'FORMDATA':
                        // if (isBodyTypeQueryProcedure && param.name === SWAGGER_CONSTANTS.WM_DATA_JSON) {
                        //     setParamsOfChildNode();
                        //     //Process query/procedure formData non-file params params
                        //     bodyInfo = this.processRequestBody(paramValueInfo, params);
                        //     requestBody = Utils.getFormData(getFormDataObj(), param, bodyInfo.requestBody);
                        //     requiredParamMissing = _.concat(requiredParamMissing, bodyInfo.missingParams);
                        // } else {
                        //     requestBody = Utils.getFormData(getFormDataObj(), param, paramValue);
                        // }
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
        // if (_.includes(operationInfo.consumes, WS_CONSTANTS.CONTENT_TYPES.FORM_URL_ENCODED)
        //     && !_.includes(WS_CONSTANTS.NON_BODY_HTTP_METHODS, (method || '').toUpperCase())) {
        //     // remove the '?' at the start of the queryParams
        //     if (queryParams) {
        //         requestBody = (requestBody ? requestBody + '&' : '') + queryParams.substring(1);
        //     }
        //     headers['Content-Type'] = WS_CONSTANTS.CONTENT_TYPES.FORM_URL_ENCODED;
        // } else {
        url += queryParams;
        // }

        /*
         * for proxy calls:
         *  - cloak the proper headers (required only for REST services)
         *  - prepare complete url from relativeUrl
         */
        if (isProxyCall) {
            //avoiding cloakHeadersForProxy when the method is invoked from apidesigner.
            //headers = variable.serviceType !== SERVICE_TYPE_REST || operationInfo.skipCloakHeaders ? headers : cloakHeadersForProxy(headers);
            if (variable._prefabName && VARIABLE_CONSTANTS.REST_SUPPORTED_SERVICES.indexOf(variable.serviceType) !== -1) {
                /* if it is a prefab variable (used in a normal project), modify the url */
                url = '/prefabs/' + variable._prefabName + url;
                target = 'invokePrefabRestService';
            } else if (!variable._prefabName) {
                url = 'services' + url;
            }
            //url = $rootScope.project.deployedUrl + url;
        }

        /*creating the params needed to invoke the service. url is generated from the relative path for the operation*/
        invokeParams = {
            // 'projectID': $rootScope.project.id,
            'url': url,
            'target': target,
            'method': method,
            'headers': headers,
            'dataParams': requestBody,
            'authDetails': authDetails,
            'isDirectCall': !isProxyCall// ,
            // 'isExtURL': variable.serviceType === SERVICE_TYPE_REST
        };

        return invokeParams;
    }

    getMethodInfo(variable, inputFields, methodInfo, options) {
        const VARIABLE_CONSTANTS = {
            PAGINATION_PARAMS: ['page', 'size', 'sort']
        };

        // if(!variable._wmServiceOperationInfo) {
        //     return {};
        // }
        // var methodInfo = Utils.getClonedObject(variable._wmServiceOperationInfo),
        var securityDefnObj = _.get(methodInfo.securityDefinitions, '0'),
            isOAuthTypeService = false; // securityDefnObj && (securityDefnObj.type === VARIABLE_CONSTANTS.REST_SERVICE.SECURITY_DEFN_OAUTH2);
        if (methodInfo.parameters) {
            methodInfo.parameters.forEach(function (param) {
                //Ignore readOnly params in case of formData file params will be duplicated
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
                        // param.sampleValue = Variables.getEvaluatedOrderBy(variable.orderBy, options.orderBy) || param.sampleValue;
                    }
                } else if (param.name === 'access_token' && isOAuthTypeService) {
                    // param.sampleValue = oAuthProviderService.getAccessToken(securityDefnObj[OAUTH_PROVIDER_KEY]);
                }
            });
        }
        return methodInfo;
    }

    makeCall(params) {
        return this.httpService.send(params);
    }

    invoke(variable: ServiceVariable) {
        const that = this;
        const metaData = this.metadataService.getByOperationId(variable.operationId);
        const operationInfo = this.getMethodInfo(variable, variable.dataBinding, metaData.wmServiceOperationInfo, {});
        const requestParams = this.constructRequestParams(variable, operationInfo, {});
        return this.makeCall(requestParams).then(function (response) {
            variable.dataSet = response.body;
            that.initiateCallback('onSuccess', variable, variable.dataSet);
        });
    }
}
