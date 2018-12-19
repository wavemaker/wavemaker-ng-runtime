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
            const classProp = attrs.get('formlayout') === 'page' ? 'app-device-liveform panel liveform-inline' : '';
            attrs.delete('dependson');
            const liveFormTmpl = `<${tagName} wmForm role="${role}" ${directiveAttr} #${counter} ngNativeValidate [formGroup]="${counter}.ngform" [noValidate]="${counter}.validationtype !== 'html'"
                    class="${classProp}" [ngClass]="${counter}.captionAlignClass" [autocomplete]="${counter}.autocomplete ? 'on' : 'off'" captionposition=${attrs.get('captionposition')}`;
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
            let mobileFormContentTmpl = '';
            let buttonTemplate = '';
            // Include mobile-navbar above the form when formlayout is set to page
            if (attrs.get('formlayout') === 'page') {
                const name = `device_liveform_header_${counter}`;
                const navbarAttrsMap = new Map<string, string>();
                navbarAttrsMap.set('title', attrs.get('title'));
                navbarAttrsMap.set('backbtnclick.event', attrs.get('backbtnclick.event'));
                buttonTemplate = `<ng-template #buttonRef let-btn="btn">
                                            <button  wmButton name="{{btn.key}}" class="navbar-btn btn-primary btn-transparent" iconclass.bind="btn.iconclass" show.bind="btn.show"
                                                     (click)="${counter}.invokeActionEvent($event, btn.action)" type.bind="btn.type" hint.bind="btn.title" shortcutkey.bind="btn.shortcutkey" disabled.bind="btn.disabled"
                                                     tabindex.bind="btn.tabindex" [class.hidden]="btn.updateMode ? !${counter}.isUpdateMode : ${counter}.isUpdateMode"></button>
                                        </ng-template>`;
                mobileFormContentTmpl = `<header wmMobileNavbar name="${name}" ${getAttrMarkup(navbarAttrsMap)}>
                                            <ng-container *ngFor="let btn of ${counter}.buttonArray" [ngTemplateOutlet]="buttonRef" [ngTemplateOutletContext]="{btn:btn}">
                                            </ng-container>
                                        </header>
                                        <div class="form-elements panel-body" >`;
            }

            tmpl = getAttrMarkup(attrs);
            return `${liveFormTmpl} ${tmpl} ${dependsOn}>
                       ${buttonTemplate} ${mobileFormContentTmpl}`;
        },
        post: (attrs) => {
            if (attrs.get('formlayout') === 'dialog') {
                return '</form></ng-template></div></div>';
            }
            if (attrs.get('formlayout') === 'page') {
                return `</div></${tagName}>`;
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
