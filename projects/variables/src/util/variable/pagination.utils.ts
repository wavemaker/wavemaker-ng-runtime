import { jmespath } from '@metrichor/jmespath';

declare const _;

export class PaginationUtils {
    /**
     * Modifies the query values with the pagination info which is retrieved from the previous API response.
     * @param variable withholds variable information 
     * @param operationInfo has metadata of the variable 
     * @returns {void} This method does not return anything
     */
    static setPaginationQueryParams(variable, operationInfo) {
        const paginationInfo = operationInfo.paginationInfo;
        operationInfo.parameters.forEach(element => {
            // pagination input information varies based on the type
            let inputParam;
            if (paginationInfo.type === 'offset' || paginationInfo.input.offset) {
                inputParam = 'offset';
            } else {
                inputParam = 'page';
            }
            // modifies query values based on the resPaginationInfo
            if (element.name === paginationInfo.input[inputParam].split('.')[0]) {
                element.sampleValue = variable.resPaginationInfo['page'];
            } else if (element.name === paginationInfo.input.size.split('.')[0]) {
                element.sampleValue = variable.resPaginationInfo['size'];
            }
        });
    }

    /**
     * Sets resPaginationInfo on the variable based on the response of the triggered api call.
     * @param variable withholds variable information 
     * @param paginationInfo has metadata of the variable's pagination
     * @param response has data of the api call's response
     * @param options has info of the api's query params
     * @returns {void} This method does not return anything
     */
    static setVariablePagination(paginationInfo, variable, response, options) {
        if (paginationInfo && !_.isEmpty(response)) {
            if (!variable.resPaginationInfo) {
                variable.resPaginationInfo = {
                    empty: false
                };
            }
            variable.resPaginationInfo['size'] = response.size;
            variable.resPaginationInfo['page'] =  response.page || 0;
            variable.resPaginationInfo['totalElements'] = response.totalElements;
            variable.resPaginationInfo['numberOfElements'] = variable.resPaginationInfo['size'];
            variable.resPaginationInfo['number'] =  options['page'] ? options['page'] - 1 : 0;
            
            /**
             * Deduce totalPages from totalElements by size.
             * If the total elements are evenly split among the pages, assign the same to totalPages
             * Else assign totalPages + 1
             */
            variable.resPaginationInfo['totalPages'] =  variable.resPaginationInfo['totalElements'] / variable.resPaginationInfo['size'];
            if (variable.resPaginationInfo['totalElements'] % variable.resPaginationInfo['size'] === 0) {
                variable.resPaginationInfo['totalPages'] = parseInt(variable.resPaginationInfo['totalPages']);
            } else {
                variable.resPaginationInfo['totalPages'] = parseInt(variable.resPaginationInfo['totalPages']) + 1;
            }

            // If pagination type is cursor, fill next & prev
            if (response.next) {
                variable.resPaginationInfo['next'] = response.next;
                variable.resPaginationInfo['prev'] = response.prev;
                variable.resPaginationInfo['last'] = response.next ? false : true;
                variable.resPaginationInfo['first'] = response.prev ? false : true;
            } else {
                variable.resPaginationInfo['first'] = variable.resPaginationInfo['page'] <= 1 ? true : false;
                // calculate last based on current page index against total pages
                variable.resPaginationInfo['last'] = response.hasMoreItems === '' ? !(variable.resPaginationInfo['page'] < variable.resPaginationInfo['totalPages']) : !response.hasMoreItems;
            }
        }
    }

    /**
     * Resolves the expression given in pagination metadata's output
     * @param item has value of each key which is inside output pagination metadata
     * @param response has data of the api call's response
     * @param resHeaders has data of the api call's response headers
     * @param res holds the information of resPaginationInfo which has to be stored on the variable
     * @param key has key name against which data has to be stored in resPaginationInfo
     * @returns {void} This method does not return anything
     */
    static setPaginationItems(item, response, res, key, resHeaders) {
        // if the item has body, resolve the expression against the response
        if (_.startsWith(item, '$body')) {
            const bodyKey = item.replace('$body.', '');
            try {
                res[key] = jmespath.search(response, bodyKey);
            } catch {
                console.warn(`${item} expression needs to be corrected as per JMES guidelines`);
            }
        } else if (_.startsWith(item, '$header')) { // if the item has header, resolve the expression against the response headers 
            const headerKey = item.replace('$header.', '');
            const headers =  (<any>Object).fromEntries(resHeaders.headers);
            const headerParams = headerKey.split('.');
            try {
                res[key] = jmespath.search(headers, headerParams[0].toLowerCase());
            } catch {
                console.warn(`${item} expression needs to be corrected as per JMES guidelines`);
            }
            if (res[key]?.length) { 
                let headerVal = res[key].join();
                if (headerParams.length === 1) { 
                    /**
                     * If the headerParams has only 1 key name assing headerVal to the res[key]
                     */
                    res[key] = headerVal;
                } else { 
                    /**
                     * If the headerParams has more than 1 key, parse the stringified headerVal which is an object
                     * Resolve the expression against headerVal object amd assign it to res[key]
                     */
                    let keyName = headerParams.slice(1).join('.');
                    const headerResp = JSON.parse(headerVal);
                    const specialChar = /[!@#$%^&*()+\=\[\]{};':"\\|,<>\/?]+/;
                    if (specialChar.test(keyName)) {
                        // If key name has expression (ex: comparission expression), add root key name to keyName
                        keyName = 'headerResp.' + keyName;
                    }
                    try {
                        res[key] = jmespath.search(headerResp, keyName);
                    } catch {
                        console.warn(`${item} expression needs to be corrected as per JMES guidelines`);
                    }
                }
            }
        }
    }

    /**
     * Set query params with the pagination info, if pagination metadata is present in query params
     * @param variable withholds variable information 
     * @param operationInfo has metadata of the variable 
     * @param options has info of the api's query params
     * @returns {void} This method does not return anything
     */
    static checkPaginationAtQuery(operationInfo, variable, options) {
        const paginationInfo = operationInfo.paginationInfo;
        // If page is not first, resPaginationInfo is present on the variable and paginationInfo's input meta has size set pagination in query params
        if (options['page'] && paginationInfo?.input.size && (variable as any).resPaginationInfo) {
            let inputParam;
            // if pagination type is offset, asssign inputParam to offset else page
            if (paginationInfo.type === 'offset' || paginationInfo.input.offset) {
                inputParam = 'offset';
            } else {
                inputParam = 'page';
            }
            const paramName = paginationInfo.input[inputParam].split('.')[0]; 
            const paramObj = _.find(operationInfo.parameters, function(obj) { return obj.name === paramName });   
            if (!_.isEmpty(variable.dataBinding) && paramObj && paramObj.parameterType === 'query') {
                /**
                 * For pagination type other than offset, assign page which is recieved from options
                 * For offset type, calculate page from size and options[page]
                 */
                if (!paginationInfo.output?.page && paginationInfo.type !== 'offset') {
                    (variable as any).resPaginationInfo['page'] = options['page'];
                } else {
                    (variable as any).resPaginationInfo['page'] = (variable as any).resPaginationInfo['size'] * (options['page'] ? (options['page'] - 1) : 1);
                }
                this.setPaginationQueryParams(variable, operationInfo);
            }
        }
    }

    /**
     * Sets the pagination info recieved from api's response in the res object
     * @param operationInfo has metadata of the variable
     * @param res holds the information of resPaginationInfo which has to be stored on the variable
     * @param paramName has key name against which data has to be stored in resPaginationInfo
     * @returns {void} This method does not return anything
     */
    static setParameterVal(paramName, res, operationInfo) {
        const param = operationInfo.paginationInfo.input[paramName].split('.')[0]; 
        const sizeObj = _.find(operationInfo.parameters, function(obj) { return obj.name === param });
        res[paramName] = _.result(sizeObj, 'sampleValue');
    }

    /**
     * Creates res object from the response recieved from the api triggered
     * @param variable withholds variable information 
     * @param operationInfo has metadata of the variable
     * @param paginationInfo has metadata of the variable's pagination
     * @param response has data of the api call's response
     * @param options has info of the api's query params
     * @param resHeaders has data of the api call's response headers
     * @returns {object} An object which holds the information of resPaginationInfo which has to be stored on the variable
     */
    static generatePaginationRes(operationInfo, paginationInfo, response, resHeaders, options, variable) {
        let res = {};
        if (paginationInfo) {
            const resOutput = paginationInfo.output;
            // If pagination type is not cursor, create the following metadata 
            if (!resOutput?.next) {
                /**
                 * If size is present in the pagination's output metadata deduce size from api's response
                 * Else deduce size from the pagination's input metadata size key
                 */
                if (resOutput?.size) {
                    this.setPaginationItems(resOutput.size, response, res, 'size', resHeaders);
                } else { 
                    this.setParameterVal('size', res, operationInfo);
                }
                /**
                 * If page is present in the pagination's output metadata deduce page from api's response
                 * Else deduce page from the pagination's input metadata page key
                 */
                if (resOutput?.page) {
                    this.setPaginationItems(resOutput.page, response, res, 'page', resHeaders);
                } else if (paginationInfo.type !== 'offset') {
                    this.setParameterVal('page', res, operationInfo);
                }
                /**
                 * If totalElements has $minValue in it, set totalElements as $minValue
                 * If the rendered elements are greater than $minValue, set totalElements as Number of elements rendered + 1
                 
                 * If totalElements is present in the pagination's output metadata deduce totalElements from api's response
                 
                 * If Pagination type is offset, deduce totalElements from size and options[page] else deduce from size and res[page]
                 */
                if (_.startsWith(resOutput?.totalElements, '$minValue')) {
                    const totalEl = resOutput.totalElements.replace('$minValue=', '');
                    const pageParam = res['page'] ? res['page'] : options['page']
                    const elRendered = res['size'] * pageParam;
                    if (!variable.resPaginationInfo || variable.resPaginationInfo['totalElements'] > elRendered) {
                        res['totalElements'] = parseInt(totalEl);
                    } else {
                        res['totalElements'] = elRendered + 1;
                    }
                } else if (resOutput?.totalElements) {
                    this.setPaginationItems(resOutput.totalElements, response, res, 'totalElements', resHeaders);
                } else {
                    if (paginationInfo.type === 'offset' || paginationInfo.input.offset) {
                        res['totalElements'] = (res['size'] * (options['page'] ? options['page'] : 1)) + 1;
                    } else {
                        res['totalElements'] = (res['size'] * res['page']) + 1;
                    }
                }
                /**
                 * If hasMoreItems is present in the pagination's output metadata deduce hasMoreItems from api's response
                 * Else assign it as empty which will be calculated at resPaginationInfo object generation
                 */
                if (resOutput?.hasMoreItems) {
                    this.setPaginationItems(resOutput.hasMoreItems, response, res, 'hasMoreItems', resHeaders);
                } else {
                    res['hasMoreItems'] = '';
                }
            } else if (resOutput) { // For cursor type pagination set next and prev keys in res object
                this.setPaginationItems(resOutput.next, response, res, 'next', resHeaders);
                this.setPaginationItems(resOutput.prev, response, res, 'prev', resHeaders);
            }
        }
        return res;
    }
}