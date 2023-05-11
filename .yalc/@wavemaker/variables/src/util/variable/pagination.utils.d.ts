export declare class PaginationUtils {
    /**
     * Modifies the query values with the pagination info which is retrieved from the previous API response.
     * @param variable withholds variable information
     * @param operationInfo has metadata of the variable
     * @param paginationInfo has metadata of the variable pagination data
     * @returns {void} This method does not return anything
     */
    static setPaginationQueryParams(variable: any, operationInfo: any, paginationInfo: any): void;
    /**
     * Sets pagination on the variable based on the response of the triggered api call.
     * @param variable withholds variable information
     * @param response has data of the api call's response
     * @param options has info of the api's query params
     * @returns {void} This method does not return anything
     */
    static setVariablePagination(variable: any, response: any, options: any): void;
    /**
     * Resolves the expression given in pagination metadata's output
     * @param item has value of each key which is inside output pagination metadata
     * @param response has data of the api call's response
     * @param resHeaders has data of the api call's response headers
     * @param res holds the information of pagination which has to be stored on the variable
     * @param key has key name against which data has to be stored in pagination
     * @returns {void} This method does not return anything
     */
    static setPaginationItems(item: any, response: any, res: any, key: any, resHeaders: any): void;
    /**
     * Return the pagination information of the service based on its existence on swagger or on the variable
     * @param variable withholds variable information
     * @param operationInfo has metadata of the variable
     * @returns {object} This method return pagination metadata
     */
    static getPaginationInfo(operationInfo: any, variable: any): any;
    /**
     * Set query params with the pagination info, if pagination metadata is present in query params
     * @param variable withholds variable information
     * @param operationInfo has metadata of the variable
     * @param options has info of the api's query params
     * @returns {void} This method does not return anything
     */
    static checkPaginationAtQuery(operationInfo: any, variable: any, options: any): void;
    /**
     * Deduces the offset information from the size and page params
     * @param variable withholds variable information
     * @param options has info of the api's query params
     * @returns {object} Returns the next offset number
     */
    static getOffsetInfo(variable: any, options: any): number;
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
    static setPaginationAtReq(paginationInfo: any, operationInfo: any, variable: any, headers: any, requestBody: any, url: any, options: any): {};
    /**
     * Sets the pagination info recieved from api's response in the res object
     * @param operationInfo has metadata of the variable
     * @param res holds the information of pagination which has to be stored on the variable
     * @param paramName has key name against which data has to be stored in pagination
     * @param variable withholds variable information
     * @returns {void} This method does not return anything
     */
    static setParameterVal(paramName: any, res: any, operationInfo: any, variable: any): void;
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
    static generatePaginationRes(operationInfo: any, paginationInfo: any, response: any, resHeaders: any, options: any, variable: any): {};
}
