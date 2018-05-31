import { initiateCallback, toasterService } from '../variable/variables.utils';
import { $rootScope, VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { dialogService } from '@wm/variables';

declare const _, window, $;

export const notify = (variable, options, success, error)  => {
    const variableName = variable.name,
        commonPageDialogId = 'Common' + _.capitalize(variable.operation) + 'Dialog',
        variableOwner = variable.owner,
        operation = variable.operation;
    let dialogId = 'notification' + variable.operation + 'dialog';
        /*Todo[Shubham]: default toaster options to be handled
        toasterOptions = ($('[toaster-options]').scope() && $('[toaster-options]').scope().config) || {},*/
    let scope;
    options = options || {};

    // callback function to execute on click of the custom notification element
    function customNotificationOnClick(toasterObj) {
        if (variable.onClick) {
            initiateCallback('onClick', variable, scope, options.data);
        }/* else {
            wmToaster.hide(toasterObj);
        }*/
    }
    // callback function to execute on hide of the custom notification element
    function customNotificationOnHide() {
        if (variable.onHide) {
            initiateCallback('onHide', variable, options.data);
        }
    }
    if (operation === 'toast') {
     const type = (options.class || variable.dataBinding.class || 'info').toLowerCase(),
        body = options.message || variable.dataBinding.text,
        timeout = parseInt(variable.dataBinding.duration, null) || 3000,
        positionClass = 'toast-' + (options.position || variable.dataBinding.toasterPosition || 'bottom right').replace(' ', '-'),
        content = variable.dataBinding.page;
        // toasterOptions.position = positionClass;
        // check the variable scope and call the callback functions accordingly
        if (variableOwner === VARIABLE_CONSTANTS.OWNER.APP) {
            scope = $rootScope || {};
        } else {
            scope = options.scope || {};
        }
        // check for the older projects not having content property in the variable
        if (variable.dataBinding.content && variable.dataBinding.content === 'page') {
            if (content) {
                /*Todo[Shubham]: handle toaster in page
                wmToaster.createCustomNotification(content, variableName, variable.dataSet, timeout, positionClass, customNotificationOnClick, customNotificationOnHide);*/
            }
        } else {
           const toaster = toasterService[type](body, null, { positionClass: positionClass, timeOut: timeout});
            toaster.onHidden.subscribe( customNotificationOnHide );
            toaster.onTap.subscribe( customNotificationOnClick );
        }
    } else {
        dialogId = (variableOwner === VARIABLE_CONSTANTS.OWNER.APP ) ? commonPageDialogId : dialogId;
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
};

export const getMessage = (variable) => {
    return variable.dataBinding.text;
};

export const setMessage = (variable, text) => {
    if (_.isString(text)) {
        variable.dataBinding.text = text;
    }
    return variable.dataBinding.text;
};


