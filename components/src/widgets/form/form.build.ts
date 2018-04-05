import { getAttrMarkup, register } from '@wm/transpiler';
import { idMaker } from '@wm/utils';

const tagName = 'form';
const idGen = idMaker('form_');

const buildTask = (isLiveForm?) => {
    return {
        pre: (attrs, shared) => {
            const counter = idGen.next().value;
            attrs.set('dialogId', 'liveformdialog-' + attrs.get('name') + '-' + counter);
            const tmpl = getAttrMarkup(attrs);
            const liveFormAttr = isLiveForm ? 'wmLiveForm' : '';
            const liveFormTmpl = `<${tagName} wmForm ${liveFormAttr} #${counter} ngNativeValidate [formGroup]="${counter}.ngForm" [noValidate]="${counter}.validationtype !== 'html'"
                        [ngClass]="${counter}.captionAlignClass" ${tmpl}>`;
            shared.set('counter', counter);
            if (attrs.get('formlayout') === 'dialog') {
                let dialogAttrsMap = new Map<string, string>();
                dialogAttrsMap.set('title', attrs.get('title'));
                dialogAttrsMap.set('iconclass', attrs.get('iconclass'));
                dialogAttrsMap.set('width', attrs.get('width'));
                return `<div data-identifier="liveform" init-widget class="app-liveform liveform-dialog">
                            <div wmDialog class="app-liveform-dialog" name="${attrs.get('dialogId')}" ${getAttrMarkup(dialogAttrsMap)} modal="true" width.bind="dialogWidth">
                        ${liveFormTmpl}`;
            }
            return liveFormTmpl;
        },
        post: (attrs) => {
            if (attrs.get('formlayout') === 'dialog') {
                return '</form></div></div>'
            }
            return `</${tagName}>`
        },
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
};

register('wm-form', buildTask);
register('wm-liveform', () => buildTask(true));

export default () => {};
