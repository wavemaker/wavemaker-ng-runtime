import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AbstractHttpService, getValidJSON, replace } from '@wm/core';

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

    /**
     * This method handles session timeout.
     * @param options
     * @param resolve
     * @param reject
     */
    handleSessionTimeout(options, subscriber401?) {
        this.sessionTimeoutQueue.push({
            requestInfo: options,
            sub401: subscriber401
        });
        this.on401();
    }

    /**
     * Generates a request with provided options
     * @param options, request params/options
     */
    private generateRequest(options: any) {
        let reqHeaders = new HttpHeaders(),
            reqParams = new HttpParams();
        const headers = options.headers;
        const params = options.params;
        const responseType = options.responseType;
        const withCredentials = options.withCredentials;

        // this header is not to be sent with non-proxy calls from service variable
        if (!options.isDirectCall) {
            reqHeaders = reqHeaders.append('X-Requested-With', 'XMLHttpRequest');
        }

        // headers
        if (headers) {
            Object.entries(headers).forEach(([k, v]) => reqHeaders = reqHeaders.append(k, v as string));
        }

        // params
        if (params) {
            Object.entries(params).forEach(([k, v]) => reqParams = reqParams.append(k, v as string));
        }

        let third, fourth;
        const reqOptions = {
            headers: reqHeaders,
            params: reqParams,
            responseType: responseType,
            withCredentials: withCredentials
        };
        // Even if method is not expecting request body, if body is passed in request, pass it on.
        if (_.includes(this.nonBodyTypeMethods, options.method && options.method.toUpperCase()) && options.data === undefined) {
            third = reqOptions;
            fourth = null;
        } else {
            third = options.data;
            fourth = reqOptions;
        }
        return new HttpRequest(options.method, options.url, third, fourth);
    }

    /**
     * This method filters and returns error message from the failed network call response.
     * @param err, error form network call failure
     */
    public getErrMessage(err: any) {
        const HTTP_STATUS_MSG = {
            404: this.getLocale()['MESSAGE_404_ERROR'] || 'Requested resource not found',
            401: this.getLocale()['MESSAGE_401_ERROR'] || 'Requested resource requires authentication',
            403: this.getLocale()['LABEL_FORBIDDEN_MESSAGE'] || 'The requested resource access/action is forbidden.'
        };

        // check if error message present for responded http status
        let errMsg = HTTP_STATUS_MSG[err.status];
        let errorDetails = err.error;
        errorDetails = getValidJSON(errorDetails) || errorDetails;

        // WM services have the format of error response as errorDetails.error
        if (errorDetails && errorDetails.errors) {
            errMsg = this.parseErrors(errorDetails.errors) || errMsg || 'Service Call Failed';
        } else {
            errMsg = errMsg || 'Service Call Failed';
        }
        return errMsg;
    }

    /**
     * Make a http call and returns an observable that can be cancelled
     * @param options, options using which the call needs to be made
     */
    sendCallAsObservable(options: any): any {
        const req = this.generateRequest(options);
        return this.httpClient.request(req);
    }

    /**
     * Makes a http call and return a promise
     * @param options, options using which the call needs to be made
     */
    send(options: any) {
        const req = this.generateRequest(options);

        return new Promise((resolve, reject) => {
            this.httpClient.request(req).toPromise().then((response) => {
                resolve(response);
            } , (err) => {
                if (this.isPlatformSessionTimeout(err)) {
                    err._401Subscriber.asObservable().subscribe((response) => {
                        resolve(response);
                    }, (e) => {
                        reject(e);
                    });
                } else {
                    const errMsg = this.getErrMessage(err);
                    reject({
                        error: errMsg,
                        details: err
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
        if (errors && errors.error && errors.error.length) {
            errors.error.forEach((errorDetails, i) => {
                errMsg += this.parseError(errorDetails) + (i > 0 ? '\n' : '');
            });
        }
        return errMsg;
    }

    parseError(errorObj) {
        let errMsg;
        errMsg = errorObj.message ? replace(errorObj.message, errorObj.parameters, true) : ((errorObj.parameters && errorObj.parameters[0]) || '');
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

    upload(url, data, options): Observable<HttpEvent<any>> {
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
                data.requestInfo.headers.headers.delete('x-wm-xsrf-token');
                that.httpClient.request(data.requestInfo)
                    .subscribe(
                        response => {
                            if (response && response.type && data.sub401) {
                                data.sub401.next(response);
                            }
                        }, (reason) => {
                            data.sub401.error(reason);
                        });
            }
        });
    }
}
