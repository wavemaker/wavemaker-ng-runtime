import { triggerFn } from '@wm/core';
import { NotifyPromise } from './notify-promise';
import { httpService } from './variable/variables.utils';

declare const _;

enum HTTP_EVENT_TYPE {
    Sent = 0,
    UploadProgress = 1,
    ResponseHeader = 2,
    DownloadProgress = 3,
    Response= 4,
    User = 5
}

enum UPLOAD_STATUS {
    QUEUED        = 'queued',
    IN_PROGRESS   = 'inprogress',
    SUCCESS       = 'success',
    ERROR         = 'error',
    ABORTED       = 'abort'
}

function transformEvent(event) {
    event.target = event.target || {
        status: event.responseCode,
        response: event.response
    };
    return event;
}

class FileTransferObject {
    name: string;
    size: string;
    status: string;
    transferFn: Function;
    abortFn: Function;
    promise: any;
    progress: number;

    constructor(file, transferFn, promise, abortFn) {
        this.name = file.name;
        this.size = file.size || '';
        this.status = UPLOAD_STATUS.QUEUED;
        this.transferFn = transferFn;
        this.promise = promise;
        this.abortFn = abortFn;
    }

    start() {
        if (this.status === UPLOAD_STATUS.QUEUED) {
            this.status = UPLOAD_STATUS.IN_PROGRESS;
            triggerFn(this.transferFn);
        }
    }

    then(onSuccess, onError, onProgress) {
        const self = this;
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
    }

    finally(onFinal?) {
        this.promise.finally(onFinal);
    }

    /* aborts the file upload */
    abort() {
        this.status = UPLOAD_STATUS.ABORTED;
        triggerFn(this.abortFn);
        this.finally();
    }

}

class AjaxFileTransferObject extends FileTransferObject {
    constructor(file, transferFn, promise, abortFn) {
        super(file, transferFn, promise, abortFn);
    }
}

/* upload file using fileTransfer */
function uploadWithFileTransfer(file, url, options) {}

/* upload file with ajax calling */
function uploadWithAjax(file, fd, url, options) {
    _.forEach(fd, (value, key) => {
        if (_.isArray(value)) {
            if (value[0] instanceof File) {
               fd.delete(key);
            }
        } else {
            if (value instanceof File) {
                fd.delete(key);
            }
        }
    });
    /* append file to form data */
    if (_.isArray(file)) {
        _.forEach(file, function (fileObject) {
            fd.append(options.paramName, fileObject, fileObject.name);
        });
    } else if (_.isObject(file)) {
        fd.append(options.paramName, file, file.name);
    }

    const promise = new NotifyPromise((resolve, reject, notify) => {
        httpService.upload(url, fd).subscribe(event => {
            if (event.type === HTTP_EVENT_TYPE.UploadProgress) {
                const uploadProgress = Math.round(100 * event.loaded / event.total);
                notify(uploadProgress);
            }

            if (event.type === HTTP_EVENT_TYPE.Response) {
                resolve(event.body);
            }
        });
    });

    return promise;
}

/* upload the file - IE9 support */
function uploadWithIframe(file, url, options) {}

/* upload the next file depending on the status */
function starNextFileTransfer(fts) {
    const ft = _.find(fts, function (ft) {
        return ft.status === UPLOAD_STATUS.QUEUED;
    });
    if (ft) {
        ft.start();
        ft.finally(starNextFileTransfer.bind(undefined, fts));
    }
}

/* upload the max no of files at once i.e. two at once based on max*/
function startFileTransfers(fts, max) {
    let i = 0;
    const len = fts.length;
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
export function upload(files, fd, config, options?) {
    options = _.extend({
        'paramName' : config.fileParamName
    }, options);
    return uploadWithAjax(files, fd, config.url, options);
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