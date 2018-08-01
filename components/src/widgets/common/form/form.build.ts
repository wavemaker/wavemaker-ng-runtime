import { Attribute, Element } from '@angular/compiler';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { IDGenerator } from '@wm/core';


const tagName = 'form';
const idGen = new IDGenerator('form_');

const formWidgets = new Set([
    'wm-text',
    'wm-textarea',
    'wm-checkbox',
    'wm-slider',
    'wm-richtexteditor',
    'wm-currency',
    'wm-switch',
    'wm-select',
    'wm-checkboxset',
    'wm-radioset',
    'wm-date',
    'wm-time',
    'wm-timestamp',
    'wm-upload',
    'wm-rating',
    'wm-datetime',
    'wm-search',
    'wm-chips',
    'wm-colorpicker',
    'wm-table'
]);

const addFormControlName = (children = []) => {
    children.forEach(childNode => {
        if (formWidgets.has(childNode.name)) {
            let key = childNode.attrs.find((attr) => attr.name === 'key' || attr.name === 'name');
            key = key && key.value;
            childNode.attrs.push(new Attribute('formControlName', key, <any>1, <any>1));
            childNode.attrs.push(new Attribute('wmFormWidget', '', <any>1, <any>1));
        }
        addFormControlName(childNode.children);
    });
};

const buildTask = (directiveAttr = ''): IBuildTaskDef => {
    return {
        requires: ['wm-livetable', 'wm-login'],
        template: (node: Element) => {
            addFormControlName(node.children);
        },
        pre: (attrs, shared, parentLiveTable, parentLoginWidget) => {
            let tmpl;
            let dialogId;
            const role = parentLoginWidget && parentLoginWidget.get('isLogin') ? 'app-login' : '';
            const counter = idGen.nextUid();
            const dependsOn = attrs.get('dependson') ? `dependson="${attrs.get('dependson')}"` : '';
            attrs.delete('dependson');
            const liveFormTmpl = `<${tagName} wmForm role="${role}" ${directiveAttr} #${counter} ngNativeValidate [formGroup]="${counter}.ngform" [noValidate]="${counter}.validationtype !== 'html'"
                        [ngClass]="${counter}.captionAlignClass" [autocomplete]="${counter}.autocomplete ? 'on' : 'off'" captionposition=${attrs.get('captionposition')}`;
            shared.set('counter', counter);
            if (attrs.get('formlayout') === 'dialog') {
                dialogId = parentLiveTable ? parentLiveTable.get('liveform_dialog_id') : `liveform_dialog_id_${counter}`;
                attrs.set('dialogId', dialogId);
                const dialogAttrsMap = new Map<string, string>();
                dialogAttrsMap.set('title', attrs.get('title'));
                dialogAttrsMap.set('iconclass', attrs.get('iconclass'));
                dialogAttrsMap.set('width', attrs.get('width'));
                attrs.set('width', '100%');
                tmpl = getAttrMarkup(attrs);
                return `<div data-identifier="liveform" init-widget class="app-liveform liveform-dialog" ${dependsOn} dialogid="${dialogId}">
                            <div wmDialog class="app-liveform-dialog" name="${dialogId}" role="form" ${getAttrMarkup(dialogAttrsMap)} modal="true">
                            <ng-template #dialogBody>
                            ${liveFormTmpl} ${tmpl}>`;
            }
            tmpl = getAttrMarkup(attrs);
            return `${liveFormTmpl} ${tmpl} ${dependsOn}>`;
        },
        post: (attrs) => {
            if (attrs.get('formlayout') === 'dialog') {
                return '</form></ng-template></div></div>';
            }
            return `</${tagName}>`;
        },
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
};

register('wm-form', buildTask);
register('wm-liveform', () => buildTask('wmLiveForm'));
register('wm-livefilter', () => buildTask('wmLiveFilter'));

export default () => {};
