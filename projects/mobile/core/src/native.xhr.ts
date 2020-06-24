const _XMLHttpRequest = window['XMLHttpRequest'];
const cordova = window['cordova'];


const enum EVENT {
    LOAD_START = 'loadstart',
    LOAD = 'load',
    LOAD_END = 'loadend',
    PROGRESS = 'progress',
    ERROR = 'error',
    ABORT = 'abort'
}

const STATUS_TEXT = {
    '100': '100 Continue',
    '101': '101 Switching Protocol',
    '102': '102 Processing (WebDAV)',
    '103': '103 Early Hints',

    '200': '200 OK',
    '201': '201 Created',
    '202': '202 Accepted',
    '203': '203 Non-Authoritative Information',
    '204': '204 No Content',
    '205': '205 Reset Content',
    '206': '206 Partial Content',
    '207': '207 Multi-Status (WebDAV)',
    '208': '208 Already Reported (WebDAV)',
    '226': '226 IM Used (HTTP Delta encoding)',

    '300': '300 Multiple Choice',
    '301': '301 Moved Permanently',
    '302': '302 Found',
    '303': '303 See Other',
    '304': '304 Not Modified',
    '305': '305 Use Proxy',
    '306': '306 unused',
    '307': '307 Temporary Redirect',
    '308': '308 Permanent Redirect'
};

class Internals {
    xhr = new _XMLHttpRequest();
    method = 'GET';
    requestHeaders = {};
    responseHeaders = {};
    responseHeaderText = '';
    url = '';
    async = true;
    listeners = {};

    constructor(public nXhr: NativeXMLHttpRequest) {}

    public triggerListeners(eventName: string, data?: any): void {
        const listeners = this.listeners[eventName];
        if (listeners) {
            listeners.forEach(function (l) {
                l.apply(window, data);
            });
        }
    }

    public copyNativeResponse(res): void {
        this.nXhr.status = res.status;
        this.nXhr.statusText = res.statusText || res.status;
        this.nXhr.response = res.data;
        this.nXhr.responseType = (res.headers && res.headers['content-type']) || 'plain/text';
        this.nXhr.responseURL = res.responseURL;
        this.nXhr.responseXML = res.responseXML;
        this.nXhr.responseText = (res.data && res.data.toString()) || res.error;
        this.responseHeaderText = ((): string => {
            const headers = [];
            for (let k in res.headers) {
                headers.push(k + ': ' + res.headers[k]);
            }
            return headers.join('\r\n');
        })();
    }

    public copyXMLHttpResponse(req: any): void {
        this.nXhr.status = req.status;
        this.nXhr.statusText = req.statusText;
        this.nXhr.response = req.response;
        this.nXhr.responseType = req.responseType;
        this.nXhr.responseURL = req.responseURL;
        this.nXhr.responseXML = req.responseXML;
        this.nXhr.responseText = req.responseText;
    }

    public sendViaXhr(body) {
        const self = this;
        this.xhr.onreadystatechange = this.nXhr.onreadystatechange;
        this.xhr.onload = function() {
            self.copyXMLHttpResponse(self.xhr);
            if (self.nXhr.onload) {
                self.nXhr.onload.apply(self.nXhr, arguments);
            }
        };
        this.xhr.onerror = this.nXhr.onerror;
        if (!this.async) {
            this.xhr.ontimeout = this.nXhr.ontimeout;
            this.xhr.timeout = this.nXhr.timeout;
        }
        this.xhr.withCredentials = this.nXhr.withCredentials;
        for (let k in this.listeners) {
            this.xhr.addEventListener(k, e => {
                this.copyXMLHttpResponse(this.xhr);
                this.triggerListeners(e.type);
            });
        }
        this.xhr.send(body);
    }

    public close() {
        for (let k in this.listeners) {
            this.listeners[k].length = 0;
        }
    }
}

export class NativeXMLHttpRequest {
    public onreadystatechange = null;
    public readyState = 0;
    public response = null;
    public responseType = null;
    public responseText = null;
    public responseURL = null;
    public responseXML = null;
    public status = 0;
    public statusText = '';
    public ontimeout = null;
    public onload = null;
    public onerror = null;
    public timeout = 0;
    public withCredentials = false;
    private progress = {
        lengthComputable: false,
        loaded : 0,
        total: 0,
        close: (success = false): void => {}
    };
    public upload =  {
        addEventListener : this.addEventListener.bind(this)
    };
    private _internal = new Internals(this);

    public abort() {
        this.status = -1;
        this._internal.triggerListeners(EVENT.ERROR);
        this.onerror && this.onerror();
        this._internal.xhr.abort();
        this.close();
    }

    public getResponseHeader(name: string) {
        return this.response.headers[name];
    }

    public getAllResponseHeaders() {
        return this._internal.responseHeaderText;
    }

    public setRequestHeader(header: string, value: string) {
        this._internal.requestHeaders[header] = value;
        this._internal.xhr.setRequestHeader(header, value);
    }

    public overrideMimeType(mime: string) {
        this._internal.xhr.overrideMimeType(mime);
    }

    public open(method: string, url: string, async = true, user?: string, password?: string) {
        this._internal.method = method;
        this._internal.url = url;
        this._internal.async = async;
        this._internal.xhr.open(method, url, async, user, password);
    }

    public send(body?: any, useBrowserXHR = false) {
        if (useBrowserXHR
            || this._internal.url.startsWith('http://localhost')
            || !this._internal.url.startsWith('http')) {
            this._internal.sendViaXhr(body);
        } else if (this.responseType === 'blob') {
            this.sendBlobViaNativePlugin(body);
        } else {
            this.sendViaNativePlugin(body);
        }
    };

    public addEventListener(eventName: string, handler: () => any) {
        this._internal.listeners[eventName] = this._internal.listeners[eventName] || [];
        this._internal.listeners[eventName].push(handler);
    }

    public removeEventListener(eventName: string, handler: () => any) {
        if (this._internal.listeners[eventName]) {
            const i = this._internal.listeners[eventName].indexOf(handler);
            this._internal.listeners[eventName].splice(i, 1);
        }
    }

    private prepareOptions(body: any) {
        body = body || {};
        const options = {
            headers: {},
            data: body,
            method: this._internal.method,
            serializer: 'raw'
        };

        if (body != null && body != undefined) {
            if (body.constructor && body.constructor.toString().indexOf('FormData()') >= 0) {
                options.serializer = 'multipart';
                this.startProgress();
            } else if(typeof body === 'string') {
                options.serializer = 'utf8';
            } else {
                options.serializer = 'urlencoded';
            }
        }
        for (let key in this._internal.requestHeaders) {
            options.headers[key] = this._internal.requestHeaders[key];
        }
        return options;
    }

    /*
     * Native plugin didn't provide any API to track upload progress.
     * This method generates a synthetic event which does not co-relates with the actual upload progress.
     */
    private startProgress(total?) {
        const _1mb = 1024 * 1024 * 8;
        total = total || _1mb;
        const interval = Math.ceil(total / _1mb) * 200;
        const slice = Math.ceil(total / _1mb) * (_1mb / 10);
        this.progress = {
            lengthComputable: true,
            loaded : 0,
            total: total,
            close: null
        };
        const triggerEvent = () => {
            this._internal.triggerListeners(EVENT.PROGRESS, [{
                lengthComputable: true,
                total: this.progress.total,
                loaded: this.progress.loaded
            }]);
        };
        const intervalId = setInterval(() => {
            if(this.progress.loaded + slice < total) {
                this.progress.loaded += slice;
            }
            triggerEvent();
        }, interval);
        this.progress.close = (success = false) => {
            if (success) {
                this.progress.loaded = this.progress.total;
            }
            triggerEvent();
            clearInterval(intervalId);
        };
    }

    private sendBlobViaNativePlugin(body: any): void {
        const options = this.prepareOptions(body);
        const tempfile = cordova.file.tempDirectory + Date.now();
        const timerId = setTimeout(() => {
            if(this.timeout > 0) {
                console.error('network call with request %O failed with timeout', this);
                this._internal.triggerListeners(EVENT.LOAD);
                this._internal.triggerListeners(EVENT.ERROR);
                this.onerror && this.onerror();
                this.ontimeout && this.ontimeout();
                this.close();
            }
        }, this.timeout > 0 ? this.timeout : 1);
        const onSuccess = (file, response) => {
            const res = {
                headers: (response && response.headers) || {},
                status: 200,
                data: file
            };
            let contentType = (response && response.headers && response.headers['content-type']);
            if (contentType) {
                res.data.type = contentType.split(';')[0];
            }
            console.log('network call with request %O successed with response : %O', this, res);
            this._internal.copyNativeResponse(res);
            this._internal.triggerListeners(EVENT.LOAD);
            this.onload && this.onload();
            clearTimeout(timerId);
        };
        const onError = (response) => {
            console.error('network call with request %O failed with response : %O', this, response);
            this._internal.triggerListeners(EVENT.LOAD, [response]);
            this._internal.triggerListeners(EVENT.ERROR, [response]);
            this.onerror && this.onerror();
            clearTimeout(timerId);
        };
        cordova.plugin.http.downloadFile(new URL(this._internal.url).href, {}, options.headers, tempfile,
            (entry, response)  => {
                entry.file(f => onSuccess(f, response), onError);
            }, onError);
    }

    private sendViaNativePlugin(body: any) {
        const options = this.prepareOptions(body);
        const timerId = setTimeout(() => {
            if(this.timeout > 0) {
                console.error('network call with request %O failed with timeout', this);
                this._internal.triggerListeners(EVENT.LOAD);
                this._internal.triggerListeners(EVENT.ERROR);
                this.ontimeout && this.ontimeout();
                this.close();
            }
        }, this.timeout > 0 ? this.timeout : 1);
        new Promise((resolve, reject) => {
            cordova.plugin.http.sendRequest(new URL(this._internal.url).href, options, resolve, reject);
        }).then(response => {
            console.log('network call with request %O successed with response : %O', this, response);
            this.progress.close(true);
            this._internal.copyNativeResponse(response);
            this._internal.triggerListeners(EVENT.LOAD);
            this.onload && this.onload();
        }, response => {
            this.progress.close();
            this._internal.copyNativeResponse(response);
            console.error('network call with request %O failed with response : %O', this, response);
            this._internal.triggerListeners(EVENT.LOAD, [response]);
            this._internal.triggerListeners(EVENT.ERROR, [response]);
            this.onerror && this.onerror();
        }).finally(() => clearTimeout(timerId));
    }

    private close() {
        this.ontimeout = null;
        this.onload = null;
        this.onerror = null;
        this.onreadystatechange = null;
        this._internal.close();
    }
}
