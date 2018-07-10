import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';

import { Subject } from 'rxjs/Subject';

import { AbstractHttpService, getClonedObject, replace } from '@wm/core';

declare const _;

@Injectable()
export class HttpServiceImpl extends AbstractHttpService {
    nonBodyTypeMethods = ['GET', 'DELETE', 'HEAD', 'OPTIONS', 'JSONP'];
    sessionTimeoutObservable = new Subject();
    sessionTimeoutQueue = [];
    localeObject: any;

    constructor(private httpClient: HttpClient) {
        super();
    }

    send(options: any) {
        let reqHeaders = new HttpHeaders(),
            reqParams = new HttpParams();
        const headers = options.headers;
        const params = options.params;
        const responseType = options.responseType;

        // this header is not to be sent with non-proxy calls from service variable
        if (!options.isDirectCall) {
            reqHeaders = reqHeaders.append('X-Requested-With', 'XMLHttpRequest');
        }

        // headers
        if (headers) {
            Object.entries(headers).forEach(([k, v]) => reqHeaders = reqHeaders.append(k, v));
        }

        // params
        if (params) {
            Object.entries(params).forEach(([k, v]) => reqParams = reqParams.append(k, v));
        }

        let third, fourth;
        const reqOptions = {
            headers: reqHeaders,
            params: reqParams,
            responseType: responseType
        };
        if (_.includes(this.nonBodyTypeMethods, options.method && options.method.toUpperCase())) {
            third = reqOptions;
            fourth = null;
        } else {
            third = options.data;
            fourth = reqOptions;
        }

        const req = new HttpRequest(options.method, options.url, third, fourth);

        return new Promise((resolve, reject) => {
            this.httpClient.request(req).toPromise().then((response) => {
                resolve(response);
            } , (response) => {
                // In case of 401, do not reject the promise.
                // push it into the queue, which will be resolved post login
                if (this.isPlatformSessionTimeout(response)) {
                    this.sessionTimeoutQueue.push({
                        requestInfo: options,
                        resolve: resolve,
                        reject: reject
                    });
                    this.on401();
                } else {
                    let errMsg;
                    if (_.isString(response)) {
                        errMsg = response;
                    } else {
                        const errorDetails = response.error;
                        if (errorDetails && errorDetails.errors) {
                            errMsg = this.parseErrors(errorDetails.errors);
                        } else {
                            errMsg = 'Service Call Failed';
                        }
                    }
                    reject({
                        error: errMsg,
                        details: response
                    });
                }
            });
        });
    }

    setLocale(locale) {
        this.localeObject = locale;
    }

    getLocale() {
        return this.localeObject;
    }

    parseErrors(errors) {
        let errMsg = '';
        errors.error.forEach((errorDetails, i) => {
            errMsg += this.parseError(errorDetails) + (i > 0 ? '\n' : '');
        });
        return errMsg;
    }

    parseError(errorObj) {
        let errMsg;
        const localeObject = this.getLocale();
        /*Check for local resources and code in the resource */
        if (!localeObject || !localeObject[errorObj.messageKey]) {
            errMsg = errorObj.message || (errorObj.parameters && errorObj.parameters[0]) || '';
            return errMsg;
        }

        /*Assigning the error message*/
        errMsg = getClonedObject(localeObject[errorObj.messageKey]);
        /*Replace the parameters in the error code with the actual strings.*/
        errMsg = replace(errMsg, errorObj.parameters);
        return errMsg;
    }

    getHeader(error, headerKey) {
        return error.headers.get(headerKey);
    }

    isPlatformSessionTimeout(error) {
        const MSG_SESSION_NOT_FOUND = 'Session Not Found';
        return error.status === 401 && this.getHeader(error, 'x-wm-login-errormessage') === MSG_SESSION_NOT_FOUND;
    }

    get(url: string, options?: any) {
        options = options || {};
        options.url = url;
        options.method = 'get';
        return this.send(options).then((response: HttpResponse<string>) => response.body);
    }

    post(url, data, options) {
        options = options || {};
        options.url = url;
        options.method = 'post';
        options.data = data;
        return this.send(options);
    }

    put(url, data, options) {
        options = options || {};
        options.url = url;
        options.method = 'put';
        options.data = data;
        return this.send(options);
    }

    patch(url, data, options) {
        options = options || {};
        options.url = url;
        options.method = 'patch';
        options.data = data;
        return this.send(options);
    }

    delete(url, options) {
        options = options || {};
        options.url = url;
        options.method = 'delete';
        return this.send(options);
    }

    head(url, options) {
        options = options || {};
        options.url = url;
        options.method = 'head';
        return this.send(options);
    }

    jsonp(url, options) {
        options = options || {};
        options.url = url;
        options.method = 'jsonp';
        return this.send(options);
    }

    upload(url, data, options) {
        const req = new HttpRequest('POST', url, data, {
            reportProgress: true // for progress data
        });
        return this.httpClient.request(req);
        // return this.httpClient.post(url, data, {
        //     reportProgress: true
        // });
    }

    /**
     * registers a callback to be trigerred on session timeout
     * @param callback
     */
    registerOnSessionTimeout(callback) {
        this.sessionTimeoutObservable.asObservable().subscribe(callback);
    }

    /**
     * trigger the registered methods on session timeout
     */
    on401() {
        this.sessionTimeoutObservable.next();
    }

    pushToSessionFailureQueue(callback) {
        this.sessionTimeoutQueue.push({
            callback: callback
        });
    }

    /**
     * Execute queued requests, failed due to session timeout
     */
    executeSessionFailureRequests() {
        const queue = this.sessionTimeoutQueue;
        const that = this;
        that.sessionTimeoutQueue = [];
        queue.forEach(data => {
            if (_.isFunction(data.callback)) {
                data.callback();
            } else {
                that.send(data.requestInfo)
                    .then(
                        response => data.resolve(response),
                        reason =>  data.reject(reason)
                    );
            }
        });
    }
}