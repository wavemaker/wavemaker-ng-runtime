import { $parseEvent, $watch, findValueOf, getBlob, getClonedObject, stringStartsWith, triggerFn } from '@wm/core';
import { CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS } from '../../constants/variables.constants';

declare const window, _, $;

const exportTypesMap   = { 'EXCEL' : '.xlsx', 'CSV' : '.csv'};

export let appManager;
export let httpService;
export let metadataService;
export let routerService;
export let toasterService;
export let oauthService;
export let securityService;
export let dialogService;

const DOT_EXPR_REX = /^\[("|')[\w\W]*(\1)\]$/,
    internalBoundNodeMap = new Map(),
    timers = new Map();

const _invoke = (variable, op) => {
    let debouncedFn,
        cancelFn = _.noop;
    if (timers.has(variable)) {
        cancelFn = timers.get(variable).cancel;
    }
    cancelFn();
    debouncedFn = _.debounce(function () {
        variable[op]();
    }, 100);
    timers.set(variable, debouncedFn);
    debouncedFn();
};

const processVariablePostBindUpdate = (nodeName, nodeVal, nodeType, variable, noUpdate) => {
    switch (variable.category) {
        case VARIABLE_CONSTANTS.CATEGORY.LIVE:
            if (variable.operation === 'read') {
                if (nodeName === 'dataBinding') {
                    _.forEach(nodeVal, function (val, key) {
                        variable.filterFields[key] = {
                            'value': val
                        };
                    });
                } else {
                    variable.filterFields[nodeName] = {
                        'value': nodeVal,
                        'type' : nodeType
                    };
                }
                /* if auto-update set for the variable with read operation only, get its data */
                if (variable.autoUpdate && !_.isUndefined(nodeVal) && _.isFunction(variable.listRecords) && !noUpdate) {
                    _invoke(variable, 'listRecords');
                }
            } else {
                if (nodeName === 'dataBinding') {
                    variable.inputFields = nodeVal;
                } else {
                    variable.inputFields[nodeName] = nodeVal;
                }
                /* if auto-update set for the variable with read operation only, get its data */
                if (variable.autoUpdate && !_.isUndefined(nodeVal) && _.isFunction(variable[variable.operation + 'Record']) && !noUpdate) {
                    _invoke(variable, variable.operation + 'Record');
                }
            }
            break;
        case VARIABLE_CONSTANTS.CATEGORY.SERVICE:
            if (variable.autoUpdate && !_.isUndefined(nodeVal) && _.isFunction(variable.invoke) && !noUpdate) {
                _invoke(variable, 'invoke');
            }
            break;
        case VARIABLE_CONSTANTS.CATEGORY.LOGIN:
            if (variable.autoUpdate && !_.isUndefined(nodeVal) && _.isFunction(variable.invoke) && !noUpdate) {
                _invoke(variable, 'invoke');
            }
            break;
        case VARIABLE_CONSTANTS.CATEGORY.DEVICE:
            variable[nodeName] = nodeVal;
            if (variable.autoUpdate && !_.isUndefined(nodeVal) && _.isFunction(variable.invoke) && !noUpdate) {
                _invoke(variable, 'invoke');
            }
            break;
    }
};

export const setDependency = (type: string, ref: any) => {
    switch (type) {
        case 'appManager':
            appManager = ref;
            break;
        case 'http':
            httpService = ref;
            break;
        case 'metadata':
            metadataService = ref;
            break;
        case 'router':
            routerService = ref;
            break;
        case 'toaster':
            toasterService =  ref;
            break;
        case 'oAuth':
            oauthService =  ref;
            break;
        case 'security':
            securityService =  ref;
            break;
        case 'dialog':
            dialogService = ref;
            break;
    }
};

export const initiateCallback = (type: string, variable: any, data: any, xhrObj?: any, skipDefaultNotification?: boolean) => {

    /*checking if event is available and variable has event property and variable event property bound to function*/
    const eventValues = variable[type],
        callBackScope = variable._context;
    let errorVariable;
    /**
     * For error event:
     * trigger app level error handler.
     * if no event is assigned, trigger default appNotification variable.
     */
    if (type === VARIABLE_CONSTANTS.EVENT.ERROR && !skipDefaultNotification) {
        // trigger the common error handler present in app.js
        // triggerFn($rootScope.onServiceError, variable, data, xhrObj);
        if (!eventValues) {
            /* in case of error, if no event assigned, handle through default notification variable */
            errorVariable = callBackScope.Actions[VARIABLE_CONSTANTS.DEFAULT_VAR.NOTIFICATION];
            if (errorVariable) {
                data = errorVariable.getMessage() || data;
                if (_.isString(data)) {
                    errorVariable.setMessage(data);
                } else {
                    errorVariable.setMessage('An error has occured. Please check the app logs.')
                }
                errorVariable.invoke({}, undefined, undefined);
                 // $rootScope.$evalAsync(function () {
                    // $rootScope.$emit("invoke-service", VARIABLE_CONSTANTS.DEFAULT_VAR.NOTIFICATION, {scope: callBackScope, message: response});
                // });
            }
        }
    }
    // TODO: [Vibhu], check whether to support legacy event calling mechanism (ideally, it should have been migrated)
    const fn = $parseEvent(variable[type]);
    fn(variable._context, {$event: variable, $scope: data});
};

const triggerOnTimeout = (success) => {
    setTimeout(() => { triggerFn(success); }, 500);
};

const downloadFilefromResponse = (response, headerFn, success, error) => {
    // check for a filename
    let filename = '',
        filenameRegex,
        matches,
        type,
        blob,
        URL,
        downloadUrl,
        popup;
    const disposition = headerFn('Content-Disposition');
    if (disposition && disposition.indexOf('attachment') !== -1) {
        filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        matches = filenameRegex.exec(disposition);
        if (matches !== null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }

    type = headerFn('Content-Type');
    blob = new Blob([response], { type: type });

    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
        if (window.navigator.msSaveBlob(blob, filename)) {
            triggerOnTimeout(success);
        } else {
            triggerFn(error);
        }
    } else {
        URL         = window.URL || window.webkitURL;
        downloadUrl = URL.createObjectURL(blob);

        if (filename) {
            // use HTML5 a[download] attribute to specify filename
            const a = document.createElement('a');
            let reader;
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
                reader = new FileReader();
                reader.onloadend = function () {
                    let url   = reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                    popup = window.open(url, '_blank');
                    if (!popup) {
                        window.location.href = url;
                    }
                    url = undefined; // release reference before dispatching
                };
                reader.onload = triggerOnTimeout(success);
                reader.onerror = error;
                reader.readAsDataURL(blob);
            } else {
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                triggerOnTimeout(success);
            }
        } else {
            popup = window.open(downloadUrl, '_blank');
            if (!popup) {
                window.location.href = downloadUrl;
            }
        }

        setTimeout(() => { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
    }
};

const getService = (serviceName) => {
    if (!serviceName) {
        return;
    }
    return serviceName;
    // Todo: Shubham, uncomment below code
    /* /!* get a reference to the element where ng-app is defined *!/
     let appEl = WM.element('[id=ng-app]'), injector;
     if (appEl) {
     try {
     injector = appEl.injector(); // get the angular injector
     if (injector) {
     return injector.get(serviceName); // return the service
     }
     } catch (e) {
     return undefined;
     }
     }*/
};

/**
 * Construct the form data params from the URL
 * @param queryParams
 * @param params
 */
const setParamsFromURL = (queryParams, params) => {
    queryParams = _.split(queryParams, '&');
    _.forEach(queryParams, function (param) {
        param = _.split(param, '=');
        params[param[0]] = decodeURIComponent(_.join(_.slice(param, 1), '='));
    });
};

/**
 * [Todo: Shubham], Implement Download through I frame
 * Simulates file download in an app through creating and submitting a hidden form in DOM.
 * The action will be initiated through a Service Variable
 *
 * Query Params
 * The request params like query params are added as hidden input elements
 *
 * Header Params
 * The header params for a request are also added along with hidden input elements.
 * This is done as headers can not be set for a form POST call from JavaScript
 *
 * Finally, request parameters are sent as follows:
 * For a GET request, the request data is sent along with the query params.
 * For POST, it is sent as request body.
 *
 * @param variable: the variable that is called from user action
 * @param requestParams object consisting the info to construct the XHR request for the service
 */
const downloadThroughIframe = (requestParams, success) => {
    // Todo: SHubham: URL contains '//' in between which should be handled at the URL formation only
    if (requestParams.url[1] === '/' && requestParams.url[2] === '/') {
        requestParams.url = requestParams.url.slice(0, 1) + requestParams.url.slice(2);
    }
    let iFrameElement,
        formEl,
        paramElement,
        queryParams     = '';
    const IFRAME_NAME     = 'fileDownloadIFrame',
        FORM_NAME       = 'fileDownloadForm',
        CONTENT_TYPE    = 'Content-Type',
        url             = requestParams.url,
        encType         = _.get(requestParams.headers, CONTENT_TYPE),
        params          = _.pickBy(requestParams.headers, function (val, key) {return key !== CONTENT_TYPE; });
    /* Todo: shubham : define getService method
     WS_CONSTANTS    = getService('WS_CONSTANTS');*/

    /* look for existing iframe. If exists, remove it first */
    iFrameElement = $('#' + IFRAME_NAME);
    if (iFrameElement.length) {
        iFrameElement.first().remove();
    }
    iFrameElement = $('<iframe id="' + IFRAME_NAME + '" name="' + IFRAME_NAME + '" class="ng-hide"></iframe>');
    formEl        = $('<form id="' + FORM_NAME + '" name="' + FORM_NAME + '"></form>');
    formEl.attr({
        'target'  : iFrameElement.attr('name'),
        'action'  : url,
        'method'  : requestParams.method,
        'enctype' : encType
    });

    /* process query params, append a hidden input element in the form against each param */
    queryParams += url.indexOf('?') !== -1 ? url.substring(url.indexOf('?') + 1) : '';
    queryParams += encType === WS_CONSTANTS.CONTENT_TYPES.FORM_URL_ENCODED ? ((queryParams ? '&' : '') + requestParams.dataParams) : '';

    // For Non body methods only, set the input fields from query parameters
    if (_.includes(WS_CONSTANTS.NON_BODY_HTTP_METHODS, _.toUpper(requestParams.method))) {
        setParamsFromURL(queryParams, params); // Set params for URL query params
    }
    setParamsFromURL(requestParams.data, params); // Set params for request data
    _.forEach(params, function (val, key) {
        paramElement = $('<input type="hidden">');
        paramElement.attr({
            'name'  : key,
            'value' : val
        });
        formEl.append(paramElement);
    });

    /* append form to iFrame and iFrame to the document and submit the form */
    $('body').append(iFrameElement);

    // timeout for IE 10, iframeElement.contents() is empty in IE 10 without timeout
    setTimeout(function () {
        iFrameElement.contents().find('body').append(formEl);
        formEl.submit();
        triggerFn(success);
    }, 100);
};

/**
 * Makes an XHR call against the config
 * the response is converted into a blob url, which is assigned to the src attribute of an anchor element with download=true
 * a click is simulated on the anchor to download the file
 * @param config
 * @param success
 * @param error
 */
const downloadThroughAnchor = (config, success, error) => {
    const url     = config.url,
        method  = config.method,
        data    = config.dataParams || config.data,
        headers = config.headers;

    headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded';

    // Todo: Replace http with getService
    httpService.send({
        'target' : 'WebService',
        'action' : 'invokeRuntimeRestCall',
        'method' : method,
        'config' : {
            'url'    : url,
            'method' : method,
            'headers': headers
        },
        'data'   : data,
        'responseType': 'arraybuffer'
    }, function (response, httpconfig) {
        setTimeout(() => {
            downloadFilefromResponse(response, httpconfig.headers, success, error);
        }, 900);
    }, function (err) {
        triggerFn(error);
        console.log('error', err);
    });
};

/**
 * appends a timestamp on the passed filename to prevent caching
 * returns the modified file name
 * @param fileName
 * @param exportFormat
 * @returns {string}
 */
const getModifiedFileName = (fileName, exportFormat) => {
    let fileExtension;
    const currentTimestamp = Date.now();

    if (exportFormat) {
        fileExtension = exportTypesMap[exportFormat];
    } else {
        fileExtension = '.' + _.last(_.split(fileName, '.'));
        fileName = _.replace(fileName, fileExtension, '');
    }
    return fileName + '_' + currentTimestamp + fileExtension;
};

const getCookieByName = (name) => {
    // Todo: Shubham Implement cookie native js
    return 'cookie';
};

/**
 * This function returns the cookieValue if xsrf is enabled.
 * In device, xsrf cookie is stored in localStorage.
 * @returns xsrf cookie value
 */
const isXsrfEnabled = () => {
    if (CONSTANTS.hasCordova) {
        return localStorage.getItem(CONSTANTS.XSRF_COOKIE_NAME);
    }
    return false;
};

/**
 * Returns the object node for a bind object, where the value has to be updated
 * obj.target = "a"
 * @param obj
 * @param root
 * @param variable
 * @returns {*}
 */
const getTargetObj = (obj, root, variable) => {
    /*
     * if the target key is in the form as "['my.param']"
     * keep the target key as "my.param" and do not split further
     * this is done, so that, the computed value against this binding is assigned as
     *      {"my.param": "value"}
     * and not as
     *      {
     *          "my": {
     *              "param": "value"
     *          }
     *      }
     */
    let target = obj.target,
        targetObj;
    const rootNode = variable[root];
    if (DOT_EXPR_REX.test(target)) {
        targetObj = rootNode;
    } else {
        target = target.substr(0, target.lastIndexOf('.'));
        if (obj.target === root) {
            targetObj = variable;
        } else if (target) {
            targetObj = findValueOf(rootNode, target, true);
        } else {
            targetObj = rootNode;
        }
    }
    return targetObj;
};

/**
 * Gets the key for the target object
 * the computed value will be updated against this key in the targetObject(computed by getTargetObj())
 * @param target
 * @param regex
 * @returns {*}
 */
const getTargetNodeKey = (target) => {
    /*
     * if the target key is in the form as "['my.param']"
     * keep the target key as "my.param" and do not split further
     * this is done, so that, the computed value against this binding is assigned as
     *      {"my.param": "value"}
     * and not as
     *      {
     *          "my": {
     *              "param": "value"
     *          }
     *      }
     */
    let targetNodeKey;
    if (DOT_EXPR_REX.test(target)) {
        targetNodeKey = target.replace(/^(\[["'])|(["']\])$/g, '');
    } else {
        targetNodeKey = target.split('.').pop();
    }
    return targetNodeKey;
};

const setValueToNode = (target, obj, root, variable, value, noUpdate?) => {
    const targetNodeKey = getTargetNodeKey(target),
        targetObj = getTargetObj(obj, root, variable);
    value = !_.isUndefined(value) ? value : obj.value;
    /* sanity check, user can bind parent nodes to non-object values, so child node bindings may fail */
    if (targetObj) {
        targetObj[targetNodeKey] = value;
    }
    processVariablePostBindUpdate(targetNodeKey, value, obj.type, variable, noUpdate);
};

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
const updateInternalNodes = (target, root, variable) => {
    const boundInternalNodes = _.keys(_.get(internalBoundNodeMap.get(variable), [variable.name, root])),
        targetNodeKey = getTargetNodeKey(target);
    let internalNodes;
    function findInternalNodeBound() {
        return _.filter(boundInternalNodes, function (node) {
            return (node !== targetNodeKey && _.includes(node, targetNodeKey)) || (targetNodeKey === root && node !== targetNodeKey);
        });
    }
    internalNodes = findInternalNodeBound();
    if ((internalNodes.length)) {
        _.forEach(internalNodes, function (node) {
            setValueToNode(node, {target: node}, root, variable, _.get(internalBoundNodeMap.get(variable), [variable.name, root, node]));
        });
    }
};

/**
 * New Implementation (DataBinding Flat Structure with x-path targets)
 * processes a dataBinding object, if bound to expression, watches over it, else assigns value to the expression
 * @param obj dataBinding object
 * @param scope scope of the variable
 * @param root root node string (dataBinding for all variables, dataSet for static variable)
 * @param variable variable object
 */
const processBindObject = (obj, scope, root, variable) => {
    const target = obj.target,
        targetObj = getTargetObj(obj, root, variable),
        targetNodeKey = getTargetNodeKey(target),
        runMode = true;
    const destroyFn = scope.registerDestroyListener ? scope.registerDestroyListener.bind(scope) : (fn => fn());

    if (stringStartsWith(obj.value, 'bind:')) {
        destroyFn(
            $watch(obj.value.replace('bind:', ''), scope, {}, function (newVal, oldVal) {
                if ((newVal === oldVal && _.isUndefined(newVal)) || (_.isUndefined(newVal) && (!_.isUndefined(oldVal) || !_.isUndefined(targetObj[targetNodeKey])))) {
                    return;
                }
                // Skip cloning for blob column
                if (!_.includes(['blob', 'file'], obj.type)) {
                    newVal = getClonedObject(newVal);
                }
                setValueToNode(target, obj, root, variable, newVal); // cloning newVal to keep the source clean

                if (runMode) {
                    /*set the internal bound node map with the latest updated value*/
                    if (!internalBoundNodeMap.has(variable)) {
                        internalBoundNodeMap.set(variable, {});
                    }
                    _.set(internalBoundNodeMap.get(variable), [variable.name, root, target], newVal);
                    /*update the internal nodes after internal node map is set*/
                    if (_.isObject(newVal)) {
                        updateInternalNodes(target, root, variable);
                    }
                }
            })
        );
    } else if (!_.isUndefined(obj.value)) {
        setValueToNode(target, obj, root, variable, obj.value, true);
        if (runMode && root !== targetNodeKey) {
            if (!internalBoundNodeMap.has(variable)) {
                internalBoundNodeMap.set(variable, {});
            }
            _.set(internalBoundNodeMap.get(variable), [variable.name, root, target], obj.value);
        }
    }
};

//*********************************************************** PUBLIC ***********************************************************//

/**
 * Initializes watchers for binding expressions configured in the variable
 * @param variable
 * @param context, scope context in which the variable exists
 * @param {string} bindSource,  the field in variable where the databindings are configured
 *                              for most variables, it will be 'dataBinding', hence default fallback is to 'dataBinding'
 *                              for some it can be 'dataSet' and hence will be passed as param
 * @param {string} bindTarget, the object field in variable where the computed bindings will be set
 */
export const processBinding = (variable: any, context: any, bindSource?: string, bindTarget?: string) => {
    bindSource = bindSource || 'dataBinding';
    bindTarget = bindTarget || 'dataBinding';

    const bindMap = variable[bindSource];
    variable[bindSource] = {};

    if (!bindMap) {
        return;
    }
    bindMap.forEach(function (node) {
        /* for static variable change the binding with target 'dataBinding' to 'dataSet', as the results have to reflect directly in the dataSet */
        if (variable.category === 'wm.Variable' && node.target === 'dataBinding') {
            node.target = 'dataSet';
        }
        processBindObject(node, context, bindTarget, variable);
    });
};

/**
 * Downloads a file in the browser.
 * Two methods to do so, namely:
 * 1. downloadThroughAnchor, called if
 *      - if a header is to be passed
 *      OR
 *      - if security is ON and XSRF token is to be sent as well
 * NOTE: This method does not work with Safari version 10.0 and below
 *
 * 2. downloadThroughIframe
 *      - this method works across browsers and uses an iframe to downlad the file.
 * @param requestParams request params object
 * @param fileName name for the downloaded file via cordova file transfer in device
 * @param exportFormat downloaded file format
 */
export const simulateFileDownload = (requestParams, fileName, exportFormat, success, error) => {
    /*success and error callbacks are executed incase of downloadThroughAnchor
     Due to technical limitation cannot be executed incase of iframe*/
    if (CONSTANTS.hasCordova) {
        /*$rootScope.$emit('device-file-download', requestParams, getModifiedFileName(fileName, exportFormat));*/
    } else if (!_.isEmpty(requestParams.headers) || isXsrfEnabled()) {
        downloadThroughAnchor(requestParams, success, error);
    } else {
        downloadThroughIframe(requestParams, success);
    }
};

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
export const setInput = (targetObj: any, key: any, val: any, options: any) => {
    targetObj = targetObj || {};
    let keys,
        lastKey,
        paramObj = {};

    // content type check
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
        // check if the passed parameter is an object itself
        paramObj = key;
    } else if (key.indexOf('.') > -1) {
        // check for '.' in key e.g. 'employee.department'
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
    return targetObj;
};

/**
 * returns true if HTML5 File API is available else false
 * @returns {{prototype: Blob; new(blobParts?: any[], options?: BlobPropertyBag): Blob}}
 */
export const isFileUploadSupported = () => {
    return (window.File && window.FileReader && window.FileList && window.Blob);
};

/**
 *
 * @param varOrder
 * @param optionsOrder
 * @returns {any}
 */
export const getEvaluatedOrderBy = (varOrder, optionsOrder) => {
    let optionFields,
        varOrderBy;
    // If options order by is not defined, return variable order
    if (!optionsOrder || _.isEmpty(optionsOrder)) {
        return varOrder;
    }
    // If variable order by is not defined, return options order
    if (!varOrder) {
        return optionsOrder;
    }
    // If both are present, combine the options order and variable order, with options order as precedence
    varOrder     = _.split(varOrder, ',');
    optionsOrder = _.split(optionsOrder, ',');
    optionFields = _.map(optionsOrder, function (order) {
        return _.split(_.trim(order), ' ')[0];
    });
    // If a field is present in both options and variable, remove the variable orderby
    _.remove(varOrder, function (orderBy) {
        return _.includes(optionFields, _.split(_.trim(orderBy), ' ')[0]);
    });
    varOrderBy = varOrder.length ? ',' + _.join(varOrder, ',') : '';
    return _.join(optionsOrder, ',') + varOrderBy;
};

/**
 * formatting the expression as required by backend which was enclosed by ${<expression>}.
 * @param fieldDefs
 * returns fieldDefs
 */
export const formatExportExpression = fieldDefs => {
    _.forEach(fieldDefs, function (fieldDef) {
        if (fieldDef.expression) {
            fieldDef.expression = '${' + fieldDef.expression + '}';
        }
    });
    return fieldDefs;
};

export const debounceVariableCall = _invoke;