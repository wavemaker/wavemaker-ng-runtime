import { BaseActionManager } from './base-action.manager';
import { initiateCallback, toasterService, dialogService } from '../../util/variable/variables.utils';
import { getWmProjectProperties } from '@wm/core';
import {capitalize, isString} from "lodash-es";

export class NotificationActionManager extends BaseActionManager {

    private onToasterClick(variable) {
        initiateCallback('onClick', variable, '');
    }

    private onToasterHide(variable) {
        initiateCallback('onHide', variable, '');
    }

    private notifyViaToaster(variable, options) {
        if(variable.dataBinding.toasterPosition === "parte inferior derecha"){
            variable.dataBinding.toasterPosition = 'bottom right'
        }
        const type = (options.class || variable.dataBinding.class || 'info').toLowerCase(),
            body = options.message || variable.dataBinding.text,
            title = options.title,
            positionClass = 'toast-' + (options.position || variable.dataBinding.toasterPosition || 'bottom right').replace(' ', '-'),
            partialPage = variable.dataBinding.page,
            DEFAULT_DURATION = 3000;
        let duration = parseInt(options.duration || variable.dataBinding.duration, null),
            toaster;

        // duration
        if (!duration) {
            duration = (duration !== 0 && type === 'success') ? DEFAULT_DURATION : 0;
        }
        if (variable.dataBinding.content && variable.dataBinding.content === 'page' && partialPage) {
            toaster = toasterService.showCustom(partialPage, {positionClass: positionClass, timeOut: duration,
                partialParams: variable._binddataSet, context: variable._context});
        } else {
            toaster = toasterService.show(type, title, body || null, {positionClass: positionClass, timeOut: duration, enableHtml: true});
        }

        // callbacks
        if (variable.onClick) {
            toaster.onTap.subscribe( this.onToasterClick.bind(this, variable) );
        }
        if (variable.onHide) {
            toaster.onHidden.subscribe( this.onToasterHide.bind(this, variable) );
        }
    }

    private getDialogConfig(variable, options, dialogId, closeCallBackFn) {
        return {
            'title' : options.title || variable.dataBinding.title,
            'text' : options.message || variable.dataBinding.text,
            'okButtonText' : options.okButtonText || variable.dataBinding.okButtonText || 'OK',
            'cancelButtonText' : options.cancelButtonText || variable.dataBinding.cancelButtonText || 'CANCEL',
            'alerttype' : options.alerttype || variable.dataBinding.alerttype || 'information',
            onOk: () => {
                // Close the action dialog after triggering onOk callback event
                dialogService.close(dialogId, undefined, closeCallBackFn);
            },
            onCancel: () => {
                initiateCallback('onCancel', variable, options.data);
                // Close the action dialog after triggering onCancel callback event
                dialogService.close(dialogId, undefined);
            },
            onClose: () => {
                initiateCallback('onClose', variable, options.data);
            }
        };
    }

    private notifyViaDialog(variable, options) {
        const isPrefabType = getWmProjectProperties().type === 'PREFAB';
        const dialogPrefix = isPrefabType ? 'Prefab' : 'Common';
        const dialogId = dialogPrefix + capitalize(variable.operation) + 'Dialog';
        const closeCallBackFn = () => initiateCallback('onOk', variable, options.data);


        let dialogConfig: any = this.getDialogConfig(variable, options, dialogId, closeCallBackFn);
        dialogConfig = isPrefabType ? dialogConfig : { notification: dialogConfig };
        dialogService.open(dialogId, undefined, dialogConfig);
    }

// *********************************************************** PUBLIC ***********************************************************//

    notify(variable, options, success, error) {
        const operation = variable.operation;
        options = options || {};

        if (operation === 'toast') {
            this.notifyViaToaster(variable, options);
        } else {
            this.notifyViaDialog(variable, options);
        }
    }

    getMessage(variable) {
        return variable.dataBinding.text;
    }

    setMessage(variable, text) {
        if (isString(text)) {
            variable.dataBinding.text = text;
        }
        return variable.dataBinding.text;
    }

    getOkButtonText(variable) {
        return variable.dataBinding.okButtonText;
    }
    setOkButtonText(variable, text) {
        if (isString(text)) {
            variable.dataBinding.okButtonText = text;
        }
        return variable.dataBinding.okButtonText;
    }

    getToasterDuration(variable) {
        return variable.dataBinding.duration;
    }

    setToasterDuration(variable, duration) {
        variable.dataBinding.duration = duration;
        return variable.dataBinding.duration;
    }

    getToasterClass(variable) {
        return variable.dataBinding.class;
    }

    setToasterClass(variable, type) {
        if (isString(type)) {
            variable.dataBinding.class = type;
        }
        return variable.dataBinding.class;
    }

    getToasterPosition(variable) {
        return variable.dataBinding.class;
    }

    setToasterPosition(variable, position) {
        if (isString(position)) {
            variable.dataBinding.position = position;
        }
        return variable.dataBinding.position;
    }

    getAlertType(variable) {
        return variable.dataBinding.alerttype;
    }

    setAlertType(variable, alerttype) {
        if (isString(alerttype)) {
            variable.dataBinding.alerttype = alerttype;
        }
        return variable.dataBinding.alerttype;
    }

    getCancelButtonText(variable) {
        return variable.dataBinding.cancelButtonText;
    }

    setCancelButtonText(variable, text) {
        if (isString(text)) {
            variable.dataBinding.cancelButtonText = text;
        }
        return variable.dataBinding.cancelButtonText;
    }
}
