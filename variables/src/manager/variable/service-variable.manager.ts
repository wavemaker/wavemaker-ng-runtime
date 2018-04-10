
declare const _;

import { findValueOf, getBlob, getClonedObject, getValidJSON, isDefined, triggerFn, xmlToJson } from '@wm/utils';
import { ServiceVariable } from '../../model/variable/service-variable';
import { ServiceVariableUtils } from '../../util/variable/service-variable.utils';
import { $queue } from '../../util/inflight-queue';
import { BaseVariableManager } from './base-variable.manager';
import { CONSTANTS, VARIABLE_CONSTANTS, WS_CONSTANTS } from '../../constants/variables.constants';
import { setInput } from './../../util/variable/variables.utils';
import { getEvaluatedOrderBy, httpService, initiateCallback, metadataService, simulateFileDownload } from '../../util/variable/variables.utils';
import { getAccessToken, performAuthorization, removeAccessToken } from '../../util/oAuth.utils';

export class ServiceVariableManager extends BaseVariableManager {

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

        /* update the dataset against the variable, if response is non-object, insert the response in 'value' field of dataSet */
        if (!options.forceRunMode && !options.skipDataSetUpdate) {
            variable.dataSet = (!_.isObject(response)) ? {'value': response} : response;
        }

        /* trigger success callback */
        triggerFn(success, response);

        setTimeout(function () {
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
    };

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
        const inputFields = getClonedObject(options.inputFields || variable.dataBinding);
        const operationInfo = this.getMethodInfo(variable, inputFields, options);
        const requestParams = ServiceVariableUtils.constructRequestParams(variable, operationInfo, inputFields),
            _this = this;

        // check errors
        if (requestParams.error) {
            this.handleRequestMetaError(requestParams, variable, error, options);
            return;
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

        // make the call
        return this.makeCall(requestParams).then(function (response) {
            _this.processSuccessResponse(response.body, variable, options, success);
            initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, variable.dataSet);
        }, function (e) {
            _this.processErrorResponse(variable, e, error, options.xhrObj, options.skipNotification);
        });
    }

    //*********************************************************** PUBLIC ***********************************************************//

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
}