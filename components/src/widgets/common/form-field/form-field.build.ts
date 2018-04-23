import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { FormWidgetType, IDGenerator } from '@wm/core';

import { ALLFIELDS } from '../../../utils/data-utils';
import { isDataSetWidget } from '../../../utils/widget-utils';

const tagName = 'div';
const idGen = new IDGenerator('formfield_');

const getWidgetTemplate = (attrs, widgetType, counter, pCounter) => {
    let tmpl;
    const fieldName = attrs.get('key') || attrs.get('name');
    const defaultTmpl = `[class.hidden]="!${pCounter}.isUpdateMode && ${counter}.viewmodewidget !== 'default'" formControlName="${fieldName}"`;
    switch (widgetType) {
        case FormWidgetType.AUTOCOMPLETE:
        case FormWidgetType.TYPEAHEAD:
            tmpl = `<div wmSearch ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.CHECKBOX:
            tmpl = `<div wmCheckbox ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.CHECKBOXSET:
            // tmpl = `<div wmCheckbox ${defaultTmpl} #formWidget></div>`;
            break;
        case FormWidgetType.CHIPS:
            /*TODO*/
            break;
        case FormWidgetType.COLORPICKER:
            tmpl = `<div wmColorPicker ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.CURRENCY:
            tmpl = `<div wmCurrency ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.DATE:
            tmpl = `<div wmDate ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.DATETIME:
            tmpl = `<div wmDateTime ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.NUMBER:
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText" type="number" [(ngModel)]="${counter}.datavalue" role="input">`;
            break;
        case FormWidgetType.PASSWORD:
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText" type="password" [(ngModel)]="${counter}.datavalue" role="input">`;
            break;
        case FormWidgetType.RADIOSET:
            tmpl = `<div wmRadioset ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.RATING:
            tmpl = `<div wmRating ${defaultTmpl} #formWidget></div>`;
            break;
        case FormWidgetType.RICHTEXT:
            /*TODO*/
            break;
        case FormWidgetType.SELECT:
            tmpl = `<div wmSelect ${defaultTmpl} #formWidget></div>`;
            break;
        case FormWidgetType.TOGGLE:
            tmpl = `<div wmCheckbox ${defaultTmpl} #formWidget type="toggle"  role="input"></div>`;
            break;
        case FormWidgetType.SLIDER:
            tmpl = `<div wmSlider ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.SWITCH:
            tmpl = `<div wmSwitch ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.TEXT:
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText" type="${attrs.get('inputtype')}" [(ngModel)]="${counter}.datavalue" role="input">`;
            break;
        case FormWidgetType.TEXTAREA:
            tmpl = `<textarea wmTextarea ${defaultTmpl} #formWidget="wmTextarea" [(ngModel)]="${counter}.datavalue" role="input"></textarea>`;
            break;
        case FormWidgetType.TIME:
            tmpl = `<div wmTime ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.TIMESTAMP:
            tmpl = `<div wmDateTime ${defaultTmpl} #formWidget role="input"></div>`;
            break;
        case FormWidgetType.UPLOAD:
            /*TODO*/
            break;
        default:
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText" [(ngModel)]="${counter}.datavalue"  role="input">`;
            break;
    }
    return tmpl;
};

const getCaptionByWidget = (attrs, widgetType, counter) => {
    if (attrs.get('is-related') === 'true') {
        return `${counter}.getDisplayExpr()`;
    }
    if (widgetType === FormWidgetType.PASSWORD) {
        return '\'********\'';
    }
    let caption = `${counter}.value`;
    if (widgetType === FormWidgetType.DATETIME || widgetType === FormWidgetType.TIMESTAMP) {
        caption += ` | toDate:${counter}.datepattern || 'yyyy-MM-dd hh:mm:ss a'`;
    } else if (widgetType === FormWidgetType.TIME) {
        caption += ` | toDate:${counter}.timepattern || 'hh:mm a'`;
    } else if (widgetType === FormWidgetType.DATE) {
        caption += ` | toDate:${counter}.datepattern ||  'yyyy-MMM-dd'`;
    } else if (widgetType === FormWidgetType.RATING || widgetType === FormWidgetType.UPLOAD) {
        caption = '';
    } else if (isDataSetWidget(widgetType) && attrs.get('datafield') === ALLFIELDS) {
        return `${counter}.getDisplayExpr()`;
    }
    return caption;
};

register('wm-form-field', (): IBuildTaskDef => {
    return {
        requires: ['wm-form', 'wm-liveform'],
        pre: (attrs, shared, parentForm, parentLiveForm) => {
            const counter = idGen.nextUid();
            const parent = parentForm || parentLiveForm;
            const pCounter = parent.get('form_reference');
            const widgetType = attrs.get('widget') || FormWidgetType.TEXT;
            attrs.delete('widget');
            shared.set('counter', counter);
            return `<${tagName} data-role="form-field" wmFormField #${counter}="wmFormField" widgettype="${widgetType}" [class.hidden]="!${counter}.show" ${getAttrMarkup(attrs)}>
                        <div class="live-field form-group app-composite-widget clearfix caption-{{${pCounter}.captionposition}}" widget="${widgetType}">
                            <label *ngIf="${counter}.displayname" class="app-label control-label formfield-label {{${pCounter}._captionClass}}" [title]="${counter}.displayname"
                                        [ngStyle]="{width: ${pCounter}.captionsize}" [ngClass]="{'text-danger': ${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode,
                                         required: ${pCounter}.isUpdateMode && ${counter}.required}" [textContent]="${counter}.displayname"> </label>
                            <div [ngClass]="[${pCounter}._widgetClass, ${counter}.class]">
                                 <label class="form-control-static app-label"
                                       [hidden]="${pCounter}.isUpdateMode || ${counter}.viewmodewidget === 'default'" [innerHTML]="${getCaptionByWidget(attrs, widgetType, counter)}"></label>
                                ${getWidgetTemplate(attrs, widgetType, counter, pCounter)}
                                <p *ngIf="!(${counter}._control?.invalid && ${counter}._control?.touched) && ${pCounter}.isUpdateMode"
                                   class="help-block" [textContent]="${counter}.hint"></p>
                                <p *ngIf="${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode"
                                   class="help-block text-danger"
                                   [textContent]="${counter}.validationmessage"></p>
                            </div>
                        </div>`;
        },
        post: () => `</${tagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
});

export default () => {};
