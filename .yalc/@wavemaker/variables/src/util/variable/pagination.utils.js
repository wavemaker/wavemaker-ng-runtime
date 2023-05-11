import { jmespath } from '@metrichor/jmespath';
// declare const _: any;
import _ from 'lodash';
var PaginationUtils = /** @class */ (function () {
    function PaginationUtils() {
    }
    /**
     * Modifies the query values with the pagination info which is retrieved from the previous API response.
     * @param variable withholds variable information
     * @param operationInfo has metadata of the variable
     * @param paginationInfo has metadata of the variable pagination data
     * @returns {void} This method does not return anything
     */
    PaginationUtils.setPaginationQueryParams = function (variable, operationInfo, paginationInfo) {
        operationInfo.parameters.forEach(function (element) {
            // pagination input information varies based on the type
            var inputParam;
            if (paginationInfo.type === 'offset' || paginationInfo.input.offset) {
                inputParam = 'offset';
            }
            else {
                inputParam = 'page';
            }
            // modifies query values based on the pagination of variable
            // compare parameter name with the input parameter's starting naming key (ex: channelcontext in channelcontext.pagination)
            if (element.name === paginationInfo.input[inputParam].split('.')[0]) {
                element.sampleValue = variable.pagination['page'];
            }
            else if (element.name === paginationInfo.input.size.split('.')[0]) {
                element.sampleValue = variable.pagination['size'];
            }
        });
    };
    /**
     * Sets pagination on the variable based on the response of the triggered api call.
     * @param variable withholds variable information
     * @param response has data of the api call's response
     * @param options has info of the api's query params
     * @returns {void} This method does not return anything
     */
    PaginationUtils.setVariablePagination = function (variable, response, options) {
        if (!variable.pagination) {
            variable.pagination = {
                empty: false
            };
        }
        variable.pagination['size'] = response.size;
        variable.pagination['page'] = response.page || 0;
        variable.pagination['totalElements'] = response.totalElements;
        variable.pagination['numberOfElements'] = variable.pagination['size'];
        variable.pagination['number'] = options['page'] ? options['page'] - 1 : 0;
        /**
         * Deduce totalPages from totalElements by size.
         * If the total elements are evenly split among the pages, assign the same to totalPages
         * Else assign totalPages + 1
         */
        variable.pagination['totalPages'] = variable.pagination['totalElements'] / variable.pagination['size'];
        if (variable.pagination['totalElements'] % variable.pagination['size'] === 0) {
            variable.pagination['totalPages'] = parseInt(variable.pagination['totalPages']);
        }
        else {
            variable.pagination['totalPages'] = parseInt(variable.pagination['totalPages']) + 1;
        }
        // If pagination type is cursor, fill next & prev
        if (response.next) {
            variable.pagination['next'] = response.next;
            variable.pagination['prev'] = response.prev;
            variable.pagination['last'] = response.next ? false : true;
            variable.pagination['first'] = response.prev ? false : true;
        }
        else {
            variable.pagination['first'] = variable.pagination['page'] <= 1 ? true : false;
            // calculate last based on current page index against total pages
            variable.pagination['last'] = response.hasMoreItems === '' ? !(variable.pagination['page'] < variable.pagination['totalPages']) : !response.hasMoreItems;
        }
    };
    /**
     * Resolves the expression given in pagination metadata's output
     * @param item has value of each key which is inside output pagination metadata
     * @param response has data of the api call's response
     * @param resHeaders has data of the api call's response headers
     * @param res holds the information of pagination which has to be stored on the variable
     * @param key has key name against which data has to be stored in pagination
     * @returns {void} This method does not return anything
     */
    PaginationUtils.setPaginationItems = function (item, response, res, key, resHeaders) {
        var _a;
        // if the item has body, resolve the expression against the response
        if (_.startsWith(item, '$body')) {
            var bodyKey = item.replace('$body.', '');
            try {
                res[key] = jmespath.search(response, bodyKey);
            }
            catch (_b) {
                console.warn(item + " expression needs to be corrected as per JMES guidelines");
            }
        }
        else if (_.startsWith(item, '$header')) { // if the item has header, resolve the expression against the response headers 
            var headerKey = item.replace('$header.', '');
            var headers = Object.fromEntries(resHeaders.headers);
            var headerParams = headerKey.split('.');
            try {
                res[key] = jmespath.search(headers, headerParams[0].toLowerCase());
            }
            catch (_c) {
                console.warn(item + " expression needs to be corrected as per JMES guidelines");
            }
            if ((_a = res[key]) === null || _a === void 0 ? void 0 : _a.length) {
                var headerVal = res[key].join();
                if (headerParams.length === 1) {
                    /**
                     * If the headerParams has only 1 key (which is not an object) name assing headerVal to the res[key]
                     */
                    res[key] = headerVal;
                }
                else {
                    /**
                     * If the headerParams has more than 1 key (an object), parse the stringified headerVal which is an object
                     * Resolve the expression against headerVal object amd assign it to res[key]
                     */
                    var keyName = headerParams.slice(1).join('.');
                    var headerResp = JSON.parse(headerVal);
                    var specialChar = /[!@#$%^&*()+\=\[\]{};':"\\|,<>\/?]+/;
                    if (specialChar.test(keyName)) {
                        // If key name has expression (ex: comparission expression) 
                        // add root key name to keyName for JMES to resolve the expression
                        keyName = 'headerResp.' + keyName;
                    }
                    try {
                        res[key] = jmespath.search(headerResp, keyName);
                    }
                    catch (_d) {
                        console.warn(item + " expression needs to be corrected as per JMES guidelines");
                    }
                }
            }
        }
    };
    /**
     * Return the pagination information of the service based on its existence on swagger or on the variable
     * @param variable withholds variable information
     * @param operationInfo has metadata of the variable
     * @returns {object} This method return pagination metadata
     */
    PaginationUtils.getPaginationInfo = function (operationInfo, variable) {
        if (operationInfo === null || operationInfo === void 0 ? void 0 : operationInfo.paginationInfo) {
            return operationInfo.paginationInfo;
        }
        else {
            return variable._paginationConfig;
        }
    };
    /**
     * Set query params with the pagination info, if pagination metadata is present in query params
     * @param variable withholds variable information
     * @param operationInfo has metadata of the variable
     * @param options has info of the api's query params
     * @returns {void} This method does not return anything
     */
    PaginationUtils.checkPaginationAtQuery = function (operationInfo, variable, options) {
        var _a;
        var paginationInfo = this.getPaginationInfo(operationInfo, variable);
        // If page is not first, pagination is present on the variable and paginationInfo's input meta has size set pagination in query params
        var hasPagination = options && options['page'] && (paginationInfo === null || paginationInfo === void 0 ? void 0 : paginationInfo.input.size) && variable.pagination;
        if (!hasPagination) {
            return;
        }
        var inputParam;
        // if pagination type is offset, asssign inputParam to offset else page
        if (paginationInfo.type === 'offset' || paginationInfo.input.offset) {
            inputParam = 'offset';
        }
        else {
            inputParam = 'page';
        }
        var paramName = paginationInfo.input[inputParam].split('.')[0];
        var paramObj = _.find(operationInfo.parameters, function (obj) { return obj.name === paramName; });
        // check if the variable has query params and they are not empty
        if (!_.isEmpty(variable.dataBinding) && paramObj && paramObj.parameterType === 'query') {
            /**
             * For pagination type other than offset, assign page which is recieved from options
             * For offset type, calculate page from size and options[page]
             */
            if (!((_a = paginationInfo.output) === null || _a === void 0 ? void 0 : _a.page) && paginationInfo.type !== 'offset') {
                variable.pagination['page'] = options['page'];
            }
            else {
                variable.pagination['page'] = this.getOffsetInfo(variable, options);
            }
            this.setPaginationQueryParams(variable, operationInfo, paginationInfo);
        }
    };
    /**
     * Deduces the offset information from the size and page params
     * @param variable withholds variable information
     * @param options has info of the api's query params
     * @returns {object} Returns the next offset number
     */
    PaginationUtils.getOffsetInfo = function (variable, options) {
        return variable.pagination['size'] * (options['page'] ? (options['page'] - 1) : 1);
    };
    /**
     * Sets Pagination data on the request information
     * @param variable withholds variable information
     * @param operationInfo has metadata of the variable
     * @param options has info of the api's query params
     * @param paginationInfo has pagination information of the variable
     * @param headers has request headers
     * @param requestBody has request body
     * @param url has request url
     * @returns {object} Returns the request object which has pagination info
     */
    PaginationUtils.setPaginationAtReq = function (paginationInfo, operationInfo, variable, headers, requestBody, url, options) {
        var reqObj = {};
        var inputParam;
        var resObj = {};
        // pagination input information varies based on the type
        if (paginationInfo.type === 'offset' || paginationInfo.input.offset) {
            inputParam = 'offset';
        }
        else {
            inputParam = 'page';
        }
        var paramName = paginationInfo.input[inputParam].split('.')[0];
        // check if paramName is present in parameters of operation info 
        var paramObj = _.find(operationInfo.parameters, function (obj) { return obj.name === paramName; });
        // set page/offset and size from pagination if matched parameter's type is header  
        if ((paramObj === null || paramObj === void 0 ? void 0 : paramObj.parameterType) === 'header') {
            _.set(reqObj, paginationInfo.input[inputParam], variable.pagination['page']);
            _.set(reqObj, paginationInfo.input.size, variable.pagination['size']);
            headers[paramName] = JSON.stringify(reqObj[paramName]);
            resObj['headers'] = headers;
        }
        else if ((paramObj === null || paramObj === void 0 ? void 0 : paramObj.parameterType) === 'body') {
            // set page/offset and size from pagination if matched parameter's type is body 
            // assign bodyVal to updated pagination info object
            var bodyVal = JSON.parse(paramObj.sampleValue);
            var bodyParam = paginationInfo.input[inputParam].split('.')[1];
            if (bodyVal && bodyVal[bodyParam]) {
                var inputBodyParam = paginationInfo.input[inputParam].split('.').splice(1).join('.');
                if (inputParam !== 'offset') {
                    _.set(reqObj, inputBodyParam, variable.pagination['page']);
                }
                else {
                    _.set(reqObj, inputBodyParam, this.getOffsetInfo(variable, options));
                }
                _.set(reqObj, paginationInfo.input.size.split('.').splice(1).join('.'), variable.pagination['size']);
                bodyVal[bodyParam] = reqObj[bodyParam];
                requestBody = JSON.stringify(bodyVal);
                resObj['requestBody'] = requestBody;
            }
        }
        else if (variable.pagination.next && paramObj) {
            /**
             * For cursor type pagination, if pagination info is present in the path
             * Based on whether user clicks on the next or prev button modify the url
             */
            if (paramObj.parameterType === 'path') {
                var urlParams = operationInfo.relativePath.split('/'), paramConfig = '{' + paramObj.name + '}', paramIndex = urlParams.indexOf(paramConfig);
                var invokeUrl = void 0;
                if (variable.pagination.isNext) {
                    invokeUrl = variable.pagination.next.split('/');
                }
                else {
                    invokeUrl = variable.pagination.prev.split('/');
                }
                var urlPathParmas = void 0;
                var urlPath = void 0;
                if (operationInfo.directPath) { // For direct path, as url has hostname, derivate pathname using URL object
                    urlPath = new URL(url);
                    urlPathParmas = urlPath.pathname.split('/');
                    urlPathParmas[paramIndex] = invokeUrl[paramIndex];
                    urlPath.pathname = urlPathParmas.join('/');
                    url = urlPath.href;
                    resObj['url'] = url;
                }
                else { // Else modify the url with index as +1 (following proxy pattern)
                    urlPathParmas = url.split('/');
                    urlPathParmas[paramIndex + 1] = invokeUrl[paramIndex];
                    url = urlPathParmas.join('/');
                    resObj['url'] = url;
                }
            }
            else if (paramObj.parameterType === 'query') {
                /**
                 * For cursor type pagination, if pagination info is present in the query
                 * Based on whether user clicks on the next or prev button modify the url's query params
                 */
                var urlParams = url.split('?');
                var invokeUrl = void 0;
                if (variable.pagination.isNext) {
                    invokeUrl = variable.pagination.next.split('?');
                }
                else {
                    invokeUrl = variable.pagination.prev.split('?');
                }
                urlParams[1] = invokeUrl[1];
                url = urlParams.join('?');
                resObj['url'] = url;
            }
        }
        return resObj;
    };
    /**
     * Sets the pagination info recieved from api's response in the res object
     * @param operationInfo has metadata of the variable
     * @param res holds the information of pagination which has to be stored on the variable
     * @param paramName has key name against which data has to be stored in pagination
     * @param variable withholds variable information
     * @returns {void} This method does not return anything
     */
    PaginationUtils.setParameterVal = function (paramName, res, operationInfo, variable) {
        var paginationInfo = this.getPaginationInfo(operationInfo, variable);
        var param = paginationInfo.input[paramName].split('.')[0];
        var sizeObj = _.find(operationInfo.parameters, function (obj) { return obj.name === param; });
        res[paramName] = _.result(sizeObj, 'sampleValue');
    };
    /**
     * Creates res object from the response recieved from the api triggered
     * @param variable withholds variable information
     * @param operationInfo has metadata of the variable
     * @param paginationInfo has metadata of the variable's pagination
     * @param response has data of the api call's response
     * @param options has info of the api's query params
     * @param resHeaders has data of the api call's response headers
     * @returns {object} An object which holds the information of pagination which has to be stored on the variable
     */
    PaginationUtils.generatePaginationRes = function (operationInfo, paginationInfo, response, resHeaders, options, variable) {
        var res = {};
        var resOutput = paginationInfo.output;
        // If pagination type is not cursor, create the following metadata 
        if (!(resOutput === null || resOutput === void 0 ? void 0 : resOutput.next)) {
            /**
             * If size is present in the pagination's output metadata deduce size from api's response
             * Else deduce size from the pagination's input metadata size key
             */
            if (resOutput === null || resOutput === void 0 ? void 0 : resOutput.size) {
                this.setPaginationItems(resOutput.size, response, res, 'size', resHeaders);
            }
            else {
                this.setParameterVal('size', res, operationInfo, variable);
            }
            /**
             * If page is present in the pagination's output metadata deduce page from api's response
             * Else deduce page from the pagination's input metadata page key
             */
            if (resOutput === null || resOutput === void 0 ? void 0 : resOutput.page) {
                this.setPaginationItems(resOutput.page, response, res, 'page', resHeaders);
            }
            else if (paginationInfo.type !== 'offset') {
                this.setParameterVal('page', res, operationInfo, variable);
            }
            /**
             * If totalElements has $minValue in it, set totalElements as $minValue
             * If the rendered elements are greater than $minValue, set totalElements as Number of elements rendered + 1
             
                * If totalElements is present in the pagination's output metadata deduce totalElements from api's response
                
                * If Pagination type is offset, deduce totalElements from size and options[page] else deduce from size and res[page]
                */
            if (_.startsWith(resOutput === null || resOutput === void 0 ? void 0 : resOutput.totalElements, '$minValue')) {
                var totalEl = resOutput.totalElements.replace('$minValue=', '');
                var pageParam = res['page'] ? res['page'] : options['page'];
                var elRendered = res['size'] * pageParam;
                if (!variable.pagination || variable.pagination['totalElements'] > elRendered) {
                    res['totalElements'] = parseInt(totalEl);
                }
                else {
                    res['totalElements'] = elRendered + 1;
                }
            }
            else if (resOutput === null || resOutput === void 0 ? void 0 : resOutput.totalElements) {
                this.setPaginationItems(resOutput.totalElements, response, res, 'totalElements', resHeaders);
            }
            else {
                if (paginationInfo.type === 'offset' || paginationInfo.input.offset) {
                    res['totalElements'] = (res['size'] * (options['page'] ? options['page'] : 1)) + 1;
                }
                else {
                    res['totalElements'] = (res['size'] * res['page']) + 1;
                }
            }
            /**
             * If hasMoreItems is present in the pagination's output metadata deduce hasMoreItems from api's response
             * Else assign it as empty which will be calculated at pagination object generation
             */
            if (resOutput === null || resOutput === void 0 ? void 0 : resOutput.hasMoreItems) {
                this.setPaginationItems(resOutput.hasMoreItems, response, res, 'hasMoreItems', resHeaders);
            }
            else {
                res['hasMoreItems'] = '';
            }
        }
        else if (resOutput) { // For cursor type pagination set next and prev keys in res object
            this.setPaginationItems(resOutput.next, response, res, 'next', resHeaders);
            this.setPaginationItems(resOutput.prev, response, res, 'prev', resHeaders);
        }
        return res;
    };
    return PaginationUtils;
}());
export { PaginationUtils };
//# sourceMappingURL=pagination.utils.js.map