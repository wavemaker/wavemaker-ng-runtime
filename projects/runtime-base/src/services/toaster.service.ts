import { Injectable } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { AbstractToasterService, isDefined } from '@wm/core';

import { CustomToasterComponent } from '../components/custom-toaster.component';

import * as _ from 'lodash-es';

@Injectable()
export class ToasterServiceImpl extends AbstractToasterService {

    constructor(private toaster: ToastrService) {
        super();
    }

    private _showToaster (type: string, title: string, desc: string, options?: any) {
        // backward compatibility (in 9.x, 4th param is timeout value).
        if (_.isNumber(options)) {
            options = {timeOut: options};
        }

        options = options || {};
        options.timeOut = isDefined(options.timeOut) ? options.timeOut : 0;
        options.enableHtml = isDefined(options.enableHtml);
        options.positionClass = options.positionClass || 'toast-bottom-right';
        options.toastClass = 'toast';
        // pop the toaster only if either title or description are defined
        if (title || desc) {
            // if the desc is an object, stringify it.
            if (!options.bodyOutputType && _.isObject(desc)) {
                desc = JSON.stringify(desc);
            }
            const fn = this.toaster[type];
            if (fn) {
                return fn.call(this.toaster, desc, title, options);
            }
        }
    }

    public success (title, desc) {
        return this._showToaster('success', title, desc, {timeOut: 5000});
    }

    public error (title, desc) {
        return this._showToaster('error', title, desc, {timeOut: 0});
    }

    public info (title, desc) {
        return this._showToaster('info', title, desc, {timeOut: 0});
    }

    public warn (title, desc) {
        return this._showToaster('warning', title, desc, {timeOut: 0});
    }

    public show (type, title, desc, options) {
        return this._showToaster(type, title, desc, options);
    }

    public hide (toasterObj) {
        // in studio just ignore the toasterObj and hide all the toasters
        if (!toasterObj) {
            this.toaster.clear();
            return;
        }
        this.toaster.clear(toasterObj.toastId);
    }

    public showCustom(page, options) {
        if (!page) {
            return;
        }
        options = options || {};
        options.toastComponent = CustomToasterComponent;
        options.toastClass = 'custom-toaster';
        options.timeOut = isDefined(options.timeOut) ? options.timeOut : 0;
        options.enableHtml = isDefined(options.enableHtml);
        options.positionClass = options.positionClass || 'toast-bottom-right';
        options.toastClass = 'toast';
        return this.toaster.show(page, '', options);
    }

    /**
     * Updates the Global Toaster options based on the passed object. Useful in cases where
     * a user wants to display multiple toasts at the same time, newest on bottom etc
     * @param {options} Object
     */
    public setToasterConfig(options) {
        if (_.isObject(options)) {
            _.merge(this.toaster.toastrConfig, options);
        } else {
            console.warn('Please pass a valid options object, For Example : {maxOpened: 1, autoDismiss: true}');
        }
    }
}
