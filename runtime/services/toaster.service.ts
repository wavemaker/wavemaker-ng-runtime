import { Injectable } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { noop, AbstractToasterService } from '@wm/core';

declare const _;

@Injectable()
export class ToasterServiceImpl extends AbstractToasterService {

    constructor(private toaster: ToastrService) {
        super();
    }

    private _showToaster (type: string, title: string, desc: string, timeout: number = 0, bodyOutputType?, onClickHandler = noop, onHideCallback = noop) {
        // pop the toaster only if either title or description are defined
        if (title || desc) {
            // call pop function in toaster to show the toaster
            // Not closing the toaster only in case type is not success and there is not timeout specified

            if (!timeout) {
                timeout = (timeout !== 0 && type === 'success') ? 5000 : 0;
            }

            // if the desc is an object, stringify it.
            if (!bodyOutputType && _.isObject(desc)) {
                desc = JSON.stringify(desc);
            }
            const fn = this.toaster[type];
            if (fn) {
                const toasterObj = fn.call(this.toaster, desc, title, {
                    timeOut: timeout,
                    enableHtml: true,
                    positionClass: 'toast-bottom-right',
                    extendedTimeOut: 0
                });
                toasterObj.onTap.subscribe(onClickHandler);
                toasterObj.onHidden.subscribe(onHideCallback);
            }
        }
    }

    public success (title, desc) {
        this._showToaster('success', title, desc, 5000);
    }

    public error (title, desc) {
        this._showToaster('error', title, desc, 0);
    }

    public info (title, desc) {
        this._showToaster('info', title, desc, 0);
    }

    public warn (title, desc) {
        this._showToaster('warning', title, desc, 0);
    }

    public show (type, title, desc, timeout, bodyOutputType, onClickHandler, onHideCallback) {
        this._showToaster(type, title, desc, timeout, bodyOutputType, onClickHandler, onHideCallback);
    }

    public hide (toasterObj) {
        // in studio just ignore the toasterObj and hide all the toasters
        if (!toasterObj) {
            this.toaster.clear();
            return;
        }
        this.toaster.clear(toasterObj.toastId);
    }

}