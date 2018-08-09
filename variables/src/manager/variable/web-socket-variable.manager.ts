import { BaseVariableManager } from './base-variable.manager';
import { WebSocketVariable } from '../../model/variable/web-socket-variable';
import { initiateCallback, metadataService } from '../../util/variable/variables.utils';
import { CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { getClonedObject, getValidJSON, isDefined, isInsecureContentRequest, isObject, triggerFn, xmlToJson } from '@wm/core';
import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { ServiceVariableUtils } from '../../util/variable/service-variable.utils';

declare const _;

export class WebSocketVariableManager extends BaseVariableManager {

    scope_var_socket_map = {};
    PROPERTY = {
        'SERVICE': 'service',
        'DATA_UPDATE_STRATEGY': 'dataUpdateStrategy',
        'DATA_LIMIT': 'dataLimit'
    };
    DATA_UPDATE_STRATEGY = {
        'REFRESH': 'refresh',
        'PREPEND': 'prepend',
        'APPEND': 'append'
    };

    /**
     * returns the state of property to decide weather to append new messages to dataSet or not
     * @param variable
     * @returns boolean
     */
    private shouldAppendData(variable) {
        variable = variable || this;
        return variable[this.PROPERTY.DATA_UPDATE_STRATEGY] !== this.DATA_UPDATE_STRATEGY.REFRESH;
    }

    /**
     * returns the state of property to decide weather to APPEND or PREPEND new messages to dataSet
     * @param variable
     * @returns boolean
     */
    private shouldAppendLast(variable) {
        return variable[this.PROPERTY.DATA_UPDATE_STRATEGY] === this.DATA_UPDATE_STRATEGY.APPEND;
    }

    /**
     * returns upper limit on number of records to be in dataSet
     * this is applicable only when appendData is true
     * @param variable
     * @returns {dataLimit}
     */
    private getDataLimit(variable) {
        return variable.dataLimit;
    }

    /**
     * get url from wmServiceOperationInfo
     * @param variable
     * @returns {*}
     */
    private getURL(variable) {
        const opInfo = _.get(metadataService.getByOperationId(variable.operationId), 'wmServiceOperationInfo'),
            inputFields = variable.dataBinding;
        let config;

        // add sample values to the params (url and path)
        _.forEach(opInfo.parameters, function (param) {
            param.sampleValue = inputFields[param.name];
        });
        // although, no header params will be present, keeping 'skipCloakHeaders' flag if support provided later
        $.extend(opInfo, {
            skipCloakHeaders: true
        });

        // call common method to prepare config for the service operation info.
        config = ServiceVariableUtils.constructRequestParams(variable, opInfo, inputFields);
        /* if error found, return */
        if (config.error && config.error.message) {
            this._onSocketError(variable, {data: config.error.message});
            return;
        }
        return config.url;
    }

    /**
     * handler for onMessage event on a socket connection for a variable
     * the data returned is converted to JSON from string/xml and assigned to dataSet of variable
     * If not able to do so, message is simply assigned to the dataSet of variable
     * If appendData property is set, the message is appended to the dataSet, else it replaces the existing value of dataSet
     * @param variable
     * @param evt
     * @private
     */
    private _onSocketMessage(variable, evt) {
        let data = _.get(evt, 'data'), value, dataLength, dataLimit, shouldAddToLast, insertIdx;
        data = getValidJSON(data) || xmlToJson(data) || data;
        // EVENT: ON_MESSAGE
        value = initiateCallback(VARIABLE_CONSTANTS.EVENT.MESSAGE_RECEIVE, variable, data, evt);
        data = isDefined(value) ? value : data;
        if (this.shouldAppendData(variable)) {
            variable.dataSet = variable.dataSet || [];
            dataLength = variable.dataSet.length;
            dataLimit = this.getDataLimit(variable);
            shouldAddToLast = this.shouldAppendLast(variable);
            if (dataLimit && (dataLength >= dataLimit)) {
                if (shouldAddToLast) {
                    variable.dataSet.shift();
                } else {
                    variable.dataSet.pop();
                }
            }
            insertIdx = shouldAddToLast ? dataLength : 0;
            variable.dataSet.splice(insertIdx, 0, data);
        } else {
            variable.dataSet = isDefined(value) ? value : data;
        }
    }

    /**
     * calls the ON_BEFORE_SEND callback on the variable
     * @param variable
     * @param message
     * @returns {*}
     * @private
     */
    private _onBeforeSend(variable, message) {
        // EVENT: ON_BEFORE_SEND
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_SEND, variable, message);
    }

    /**
     * calls the ON_BEFORE_CLOSE callback assigned to the variable
     * @param variable
     * @param evt
     * @returns {*}
     * @private
     */
    private _onBeforeSocketClose(variable, evt?) {
        // EVENT: ON_BEFORE_CLOSE
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_CLOSE, variable, _.get(evt, 'data'), evt);
    }

    /**
     * calls the ON_BEFORE_OPEN callback assigned
     * called just before the connection is open
     * @param variable
     * @param evt
     * @returns {*}
     * @private
     */
    private _onBeforeSocketOpen(variable, evt?) {
        // EVENT: ON_BEFORE_OPEN
        return initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_OPEN, variable, _.get(evt, 'data'), evt);
    }

    /**
     * calls the ON_OPEN event on the variable
     * this is called once the connection is established by the variable with the target WebSocket service
     * @param variable
     * @param evt
     * @private
     */
    private _onSocketOpen(variable, evt) {
        variable._socketConnected = true;
        // EVENT: ON_OPEN
        initiateCallback(VARIABLE_CONSTANTS.EVENT.OPEN, variable, _.get(evt, 'data'), evt);
    }

    /**
     * clears the socket variable against the variable in a scope
     * @param variable
     */
    private freeSocket(variable) {
        _.set(this.scope_var_socket_map, [ variable.name], undefined);
    }

    /**
     * calls the ON_CLOSE event on the variable
     * this is called on close of an existing connection on a variable
     * @param variable
     * @param evt
     * @private
     */
    private _onSocketClose(variable, evt) {
        variable._socketConnected = false;
        this.freeSocket(variable);
        // EVENT: ON_CLOSE
        initiateCallback(VARIABLE_CONSTANTS.EVENT.CLOSE, variable, _.get(evt, 'data'), evt);
    }

    /**
     * calls the ON_ERROR event on the variable
     * this is called if an error occurs while connecting to the socket service
     * @param variable
     * @param evt
     * @private
     */
    private _onSocketError(variable, evt) {
        variable._socketConnected = false;
        this.freeSocket(variable);
        // EVENT: ON_ERROR
        initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, _.get(evt, 'data') || 'Error while connecting with ' + variable.service, evt);
    }

    /**
     * returns an existing socket connection on the variable
     * if not present, make the connection and return it
     * @param variable
     * @returns {*}
     */
    private getSocket(variable) {
        const url     = this.getURL(variable);
        let _socket = _.get(this.scope_var_socket_map, [ variable.name]);
        if (_socket) {
            return _socket;
        }

        // Trigger error if unsecured webSocket is used in secured domain, ignore in mobile device
        if (!CONSTANTS.hasCordova && isInsecureContentRequest(url)) {
            triggerFn(this._onSocketError.bind(this, variable));
            return;
        }
        _socket = new $WebSocket(url);
        _socket.onOpen(this._onSocketOpen.bind(this, variable));
        _socket.onError(this._onSocketError.bind(this, variable));
        _socket.onMessage(this._onSocketMessage.bind(this, variable));
        _socket.onClose(this._onSocketClose.bind(this, variable));

        _.set(this.scope_var_socket_map, [variable.name], _socket);
        variable._socket = _socket;
        return _socket;
}

    /**
     * opens a socket connection on the variable.
     * URL & other meta data is fetched from wmServiceOperationInfo
     * @returns {*}
     */
    public open(variable: WebSocketVariable, success?, error?) {
        const shouldOpen = this._onBeforeSocketOpen(variable);
        let socket;
        if (shouldOpen === false) {
            triggerFn(error);
            return;
        }
        socket = this.getSocket(variable);
        triggerFn(success);
        return socket;
    }

    /**
     * closes an existing socket connection on variable
     */
    public close(variable: WebSocketVariable) {
        const shouldClose = this._onBeforeSocketClose(variable),
            socket      = this.getSocket(variable);
        if (shouldClose === false) {
            return;
        }
        socket.close();
    }

    /**
     * sends a message to the existing socket connection on the variable
     * If socket connection not open yet, open a connections and then send
     * if message provide, it is sent, else the one present in RequestBody param is sent
     * @param message
     */
    public send(variable: WebSocketVariable, message?: string) {
        const socket      = this.getSocket(variable);
        let response;

        message = message || _.get(variable, 'dataBinding.RequestBody');
        response = this._onBeforeSend(variable, message);
        if (response === false) {
            return;
        }
        message = isDefined(response) ? response : message;
        message = isObject(message) ? JSON.stringify(message) : message;
        socket.send(message, 0);
    }
}