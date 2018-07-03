import { BaseActionManager } from './base-action.manager';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { initiateCallback, toasterService } from '../../util/variable/variables.utils';
import { dialogService } from '@wm/variables';

declare const _;

export class NotificationActionManager extends BaseActionManager {

    private onToasterClick(variable) {
        initiateCallback('onClick', variable, '');
    }

    private onToasterHide(variable) {
        initiateCallback('onHide', variable, '');
    }

    private notifyViaToaster(variable, options) {
        const type = (options.class || variable.dataBinding.class || 'info').toLowerCase(),
            body = options.message || variable.dataBinding.text,
            title = options.title,
            positionClass = 'toast-' + (options.position || variable.dataBinding.toasterPosition || 'bottom right').replace(' ', '-'),
            partialPage = variable.dataBinding.page,
            DEFAULT_DURATION = 3000;
        let duration = parseInt(variable.dataBinding.duration || options.duration, null),
            toaster;

        // duration
        duration = duration === 0 ? undefined : (duration || DEFAULT_DURATION);
        if (variable.dataBinding.content && variable.dataBinding.content === 'page' && partialPage) {
            toaster = toasterService.showCustom(partialPage, {positionClass: positionClass, timeOut: duration});
        } else {
            toaster = toasterService.show(type, body, title || null, {positionClass: positionClass, timeOut: duration});
        }

        // callbacks
        if (variable.onClick) {
            toaster.onTap.subscribe( this.onToasterClick.bind(this, variable) );
        }
        if (variable.onHide) {
            toaster.onHidden.subscribe( this.onToasterHide.bind(this, variable) );
        }
    }

    private notifyViaDialog(variable, options) {
        const commonPageDialogId = 'Common' + _.capitalize(variable.operation) + 'Dialog',
            variableOwner = variable.owner,
            dialogId = (variableOwner === VARIABLE_CONSTANTS.OWNER.APP ) ? commonPageDialogId : 'notification' + variable.operation + 'dialog';
        dialogService.open(dialogId, {
            notification: {
                'title' : options.title || variable.dataBinding.title,
                'text' : options.message || variable.dataBinding.text,
                'okButtonText' : options.okButtonText || variable.dataBinding.okButtonText,
                'cancelButtonText' : options.cancelButtonText || variable.dataBinding.cancelButtonText,
                'alerttype' : options.alerttype || variable.dataBinding.alerttype,
                onOk: () => {
                    initiateCallback('onOk', variable, options.data);
                },
                onCancel: () => {
                    initiateCallback('onCancel', variable, options.data);
                },
                onClose: () => {
                    initiateCallback('onClose', variable, options.data);
                }
            }
        });
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
        if (_.isString(text)) {
            variable.dataBinding.text = text;
        }
        return variable.dataBinding.text;
    }

}