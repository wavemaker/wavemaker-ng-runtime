var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { triggerFn } from './utils';
import { NotifyPromise } from './notify-promise';
// declare const _: any;
import _ from 'lodash';
var HTTP_EVENT_TYPE;
(function (HTTP_EVENT_TYPE) {
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["Sent"] = 0] = "Sent";
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["UploadProgress"] = 1] = "UploadProgress";
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["ResponseHeader"] = 2] = "ResponseHeader";
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["DownloadProgress"] = 3] = "DownloadProgress";
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["Response"] = 4] = "Response";
    HTTP_EVENT_TYPE[HTTP_EVENT_TYPE["User"] = 5] = "User";
})(HTTP_EVENT_TYPE || (HTTP_EVENT_TYPE = {}));
var UPLOAD_STATUS;
(function (UPLOAD_STATUS) {
    UPLOAD_STATUS["QUEUED"] = "queued";
    UPLOAD_STATUS["IN_PROGRESS"] = "inprogress";
    UPLOAD_STATUS["SUCCESS"] = "success";
    UPLOAD_STATUS["ERROR"] = "error";
    UPLOAD_STATUS["ABORTED"] = "abort";
})(UPLOAD_STATUS || (UPLOAD_STATUS = {}));
function transformEvent(event) {
    event.target = event.target || {
        status: event.responseCode,
        response: event.response
    };
    return event;
}
var FileTransferObject = /** @class */ (function () {
    function FileTransferObject(file, transferFn, promise, abortFn) {
        this.name = file.name;
        this.size = file.size || '';
        this.status = UPLOAD_STATUS.QUEUED;
        this.transferFn = transferFn;
        this.promise = promise;
        this.abortFn = abortFn;
    }
    FileTransferObject.prototype.start = function () {
        if (this.status === UPLOAD_STATUS.QUEUED) {
            this.status = UPLOAD_STATUS.IN_PROGRESS;
            triggerFn(this.transferFn);
        }
    };
    FileTransferObject.prototype.then = function (onSuccess, onError, onProgress) {
        var self = this;
        this.promise.then(function (event) {
            self.status = UPLOAD_STATUS.SUCCESS;
            triggerFn(onSuccess, event);
        }, function (event) {
            self.status = UPLOAD_STATUS.ERROR;
            triggerFn(onError, event);
        }, function (event) {
            self.progress = Math.round(event.loaded / event.total * 100);
            triggerFn(onProgress, event);
        });
        return this;
    };
    FileTransferObject.prototype.finally = function (onFinal) {
        this.promise.finally(onFinal);
    };
    /* aborts the file upload */
    FileTransferObject.prototype.abort = function () {
        this.status = UPLOAD_STATUS.ABORTED;
        triggerFn(this.abortFn);
        this.finally();
    };
    return FileTransferObject;
}());
var AjaxFileTransferObject = /** @class */ (function (_super) {
    __extends(AjaxFileTransferObject, _super);
    function AjaxFileTransferObject(file, transferFn, promise, abortFn) {
        return _super.call(this, file, transferFn, promise, abortFn) || this;
    }
    return AjaxFileTransferObject;
}(FileTransferObject));
/* upload file using fileTransfer */
function uploadWithFileTransfer(file, url, options) { }
function appendFileToFormData(file, fd, options) {
    /* append file to form data */
    if (_.isArray(file)) {
        _.forEach(file, function (fileObject) {
            fd.append(options.paramName, fileObject.content || fileObject, fileObject.name);
        });
    }
    else if (_.isObject(file)) {
        fd.append(options.paramName, file.content || file, file.name);
    }
}
/* upload file with ajax calling */
function uploadWithAjax(file, httpService, fd, url, options) {
    var cloneFD = new FormData();
    var iterate = function (value, key) {
        var fileObject = (_.isArray(value) ? value[0] : value);
        if (!(fileObject instanceof File || fileObject instanceof Blob)) {
            cloneFD.append(key, value);
        }
    };
    // The foreeach method on form data doesn't exist in IE. Hence we check if it exists
    // or else use the lodash forEach
    if (fd.forEach) {
        fd.forEach(iterate);
    }
    else {
        _.forEach(fd, iterate);
    }
    appendFileToFormData(file, cloneFD, options);
    var promise = new NotifyPromise(function (resolve, reject, notify) {
        // ToDo - variable seperation
        var request = httpService.upload(url, cloneFD).subscribe(function (event) {
            if (event.type === HTTP_EVENT_TYPE.UploadProgress) {
                var uploadProgress = Math.round(100 * event.loaded / event.total);
                notify(uploadProgress);
            }
            if (event.type === HTTP_EVENT_TYPE.Response) {
                resolve(event.body);
            }
        }, function (error) {
            reject(error);
        });
        file._uploadProgress = request;
    });
    return promise;
}
/* upload the file - IE9 support */
// function uploadWithIframe(file, url, options) {}
/* upload the next file depending on the status */
function starNextFileTransfer(fts) {
    var ft = _.find(fts, function (f) {
        return f.status === UPLOAD_STATUS.QUEUED;
    });
    if (ft) {
        ft.start();
        ft.finally(starNextFileTransfer.bind(undefined, fts));
    }
}
/* upload the max no of files at once i.e. two at once based on max*/
function startFileTransfers(fts, max) {
    var i = 0;
    var len = fts.length;
    while (i < max && i < len) {
        starNextFileTransfer(fts);
        i++;
    }
}
function isMobileApp() {
    return false;
}
/**
 * This function uploads the file to the given url endpoint.
 *
 * @param file file to upload
 * @param url http endpoint to which the file has to be submitted.
 * @param options
 * @returns a promise to listen for success, event, onProgress.
 *  One can also abort the upload by simply calling abort function.
 */
export function upload(files, httpService, fd, config, options) {
    options = _.extend({
        'paramName': config.fileParamName
    }, options);
    return uploadWithAjax(files, httpService, fd, config.url, options);
    // let fileTransfers = [],
    //     url = config.uploadUrl;
    // options = _.extend({
    //     'paramName' : config.fileParamName
    // }, options);
    //
    // if (isMobileApp()) {
    //     _.forEach(files, function (file) {
    //         fileTransfers.push(uploadWithFileTransfer(file, url, options));
    //     });
    // } else if ((window as any).FormData) {
    //     _.forEach(files, function (file) {
    //         fileTransfers.push(uploadWithAjax(file, url, options));
    //     });
    // } else {
    //     _.forEach(files, function (file) {
    //         fileTransfers.push(uploadWithIframe(file, url, options));
    //     });
    // }
    // startFileTransfers(fileTransfers, 2);
    // return fileTransfers;
}
//# sourceMappingURL=file-upload.util.js.map