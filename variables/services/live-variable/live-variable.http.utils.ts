declare const _;
import { getClonedObject, getValidJSON, triggerFn, replace } from '@utils/utils';
// import {VARIABLE_URLS} from '@variables/constants/variables.constants';
import {VARIABLE_URLS} from './../../constants/variables.constants';
// import {httpService} from '@variables/utils/variables.utils';
import {httpService} from './../../utils/variables.utils';

const isStudioMode = false;

const parseConfig = (serviceParams: any): any => {

    let val, param, config;
    const urlParams = serviceParams.urlParams;

    /*get the config out of baseServiceManager*/
    if (VARIABLE_URLS.hasOwnProperty(serviceParams.target) && VARIABLE_URLS[serviceParams.target].hasOwnProperty(serviceParams.action)) {
        config = getClonedObject(VARIABLE_URLS[serviceParams.target][serviceParams.action]);

        /*To handle dynamic urls, append the serviceParams.config.url with the static url(i.e., config.url)*/
        if (serviceParams.config) {
            config.url = (serviceParams.config.url || '') + config.url;
            config.method = serviceParams.config.method || config.method;
            config.headers = config.headers || {};
            for (const key in serviceParams.config.headers) {
                val = serviceParams.config.headers[key];
                config.headers[key] = val;
            }
        }
        /* check for url parameters to replace the url */
        if (urlParams) {
            for (param in urlParams) {
                if (urlParams.hasOwnProperty(param)) {
                    val = urlParams[param];
                    if (!_.isUndefined(val) && val !== null) {
                        config.url = config.url.replace(new RegExp(':' + param, 'g'), val);
                    }
                }
            }
        }

        /* check for data */
        if (serviceParams.params) {
            config.params = serviceParams.params;
        }
        /* check for data */
        if (!_.isUndefined(serviceParams.data)) {
            config.data = serviceParams.data;
        }
        /* check for data parameters, written to support old service calls (.json calls) */
        if (serviceParams.dataParams) {
            config.data.params = serviceParams.dataParams;
        }
        /* check for headers */
        if (serviceParams.headers) {
            config.headers = serviceParams.headers;
        }

        /* set extra config flags */
        config.byPassResult    = serviceParams.byPassResult;
        config.isDirectCall    = serviceParams.isDirectCall;
        config.isExtURL        = serviceParams.isExtURL;
        config.preventMultiple = serviceParams.preventMultiple;
        config.responseType    = serviceParams.responseType;

        return config;
    }

    return null;
};

const initiateAction = function (action, params, successCallback, failureCallback, noproxy) {
    let param,
        val,
        config,
        connectionParams,
        urlParams,
        requestData,
        headers,
        httpDetails;

    // config      = getClonedObject(config[action]);
    // headers     = config && config.headers;
    requestData = params.data;

    urlParams = {
        projectID        : params.projectID,
        service          : !_.isUndefined(params.service) ? params.service : 'services',
        dataModelName    : params.dataModelName,
        entityName       : params.entityName,
        queryName        : params.queryName,
        queryParams      : params.queryParams,
        procedureName    : params.procedureName,
        procedureParams  : params.procedureParams,
        id               : params.id,
        relatedFieldName : params.relatedFieldName,
        page             : params.page,
        size             : params.size,
        sort             : params.sort,
        exportFormat     : params.exportFormat
    };
    if (params.url && isStudioMode && !noproxy) {
/*
        /!* Check for url parameters to replace the URL.
         * So the variable parameters in the URL will be replaced by the actual parameter values.*!/
        if (urlParams) {
            for (param in urlParams) {
                if (urlParams.hasOwnProperty(param)) {
                    val = urlParams[param];
                    if (!_.isUndefined(val) && val !== null) {
                        config.url = config.url.replace(new RegExp(':' + param, 'g'), val);
                    }
                }
            }
        }
        headers = headers || {};
        headers.skipSecurity = 'true';
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        /!*(!$rootScope.preferences.workspace.loadXDomainAppDataUsingProxy is added in endpointAddress to differentiate desktop from saas*!/
        if (action === 'testRunQuery') {
            headers['Content-Type'] = undefined;
            httpDetails = {
                'endpointAddress'   : $window.location.protocol + (!$rootScope.preferences.workspace.loadXDomainAppDataUsingProxy ? ('//' + $window.location.host) : '') + params.url + config.url,
                'method'            : config.method,
                'content-Type'      : 'multipart/form-data',
                'headers'           : headers
            };
            requestData.append(SWAGGER_CONSTANTS.WM_HTTP_JSON, new Blob([JSON.stringify(httpDetails)], {
                type: 'application/json'
            }));
            connectionParams = {
                'data': requestData,
                'headers': headers,
                'urlParams'         : {
                    projectID: $rootScope.project.id
                }
            };
        } else {
            connectionParams = {
                'data': {
                    'endpointAddress'   : $window.location.protocol + (!$rootScope.preferences.workspace.loadXDomainAppDataUsingProxy ? ('//' + $window.location.host) : '') + params.url + config.url,
                    'method'            : config.method,
                    'requestBody'       : JSON.stringify(requestData),
                    'headers'           : headers
                },
                'urlParams'         : {
                    projectID: $rootScope.project.id
                }
            };
        }
        WebService.testRestService(connectionParams, function (response) {
            var parsedData = getValidJSON(response.responseBody),
                errMsg,
                localeObject;
            if (parsedData.hasOwnProperty('result')) {
                triggerFn(successCallback, parsedData.result);
            } else if (parsedData.hasOwnProperty('error')) {
                triggerFn(failureCallback, (parsedData.error && parsedData.error.message) || parsedData.error);
            } else if (parsedData.hasOwnProperty('errorDetails')) {
                localeObject = $rootScope.locale || $rootScope.appLocale;
                errMsg = getClonedObject(localeObject[parsedData.errorDetails.code]);
                triggerFn(failureCallback, replace(errMsg, parsedData.errorDetails.data) || parsedData.errorDetails);
            } else {
                triggerFn(successCallback, parsedData);
            }
        }, failureCallback);*/
    } else {
        connectionParams = {
            target    : 'DATABASE',
            action    : action,
            urlParams : urlParams,
            data      : requestData || '',
            config    : {
                'url' : params.url
            }
        };
        connectionParams = parseConfig(connectionParams);

        if (action === 'exportTableData') {
            alert('Work in progress...');
            // simulateFileDownload(BaseService.parseReplace(connectionParams), connectionParams.urlParams.entityName, connectionParams.urlParams.exportFormat);
        } else {
            console.log('making call from Live variable')
            return httpService.send({
                url: connectionParams.url,
                method: connectionParams.method,
                data: connectionParams.data,
                headers: connectionParams.headers
            }, successCallback, failureCallback);
        }
    }
};

export const searchTableDataWithQuery = function (params, successCallback, failureCallback) {
    return initiateAction('searchTableDataWithQuery', params, successCallback, failureCallback, null);
};

export const searchTableData = function (params, successCallback, failureCallback) {
    return initiateAction('searchTableData', params, successCallback, failureCallback, null);
};

export const readTableData = function (params, successCallback, failureCallback) {
    return initiateAction('readTableData', params, successCallback, failureCallback, null);
};

export const insertTableData = function (params, successCallback, failureCallback) {
    return initiateAction('insertTableData', params, successCallback, failureCallback, null);
};

export const insertMultiPartTableData = function (params, successCallback, failureCallback) {
    return initiateAction('insertMultiPartTableData', params, successCallback, failureCallback, null);
};

export const updateTableData = function (params, successCallback, failureCallback) {
    return initiateAction('updateTableData', params, successCallback, failureCallback, null);
};

export const updateCompositeTableData = function (params, successCallback, failureCallback) {
    return initiateAction('updateCompositeTableData', params, successCallback, failureCallback, null);
};

export const updateMultiPartTableData = function (params, successCallback, failureCallback) {
    return initiateAction('updateMultiPartTableData', params, successCallback, failureCallback, null);
};

export const updateMultiPartCompositeTableData = function (params, successCallback, failureCallback) {
    return initiateAction('updateMultiPartCompositeTableData', params, successCallback, failureCallback, null);
};

export const deleteTableData = function (params, successCallback, failureCallback) {
    return initiateAction('deleteTableData', params, successCallback, failureCallback, null);
};

export const deleteCompositeTableData = function (params, successCallback, failureCallback) {
    return initiateAction('deleteCompositeTableData', params, successCallback, failureCallback, null);
};
