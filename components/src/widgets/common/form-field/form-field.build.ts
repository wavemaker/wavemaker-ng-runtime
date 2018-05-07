import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { FormWidgetType, IDGenerator } from '@wm/core';

import { ALLFIELDS } from '../../../utils/data-utils';
import { isDataSetWidget } from '../../../utils/widget-utils';

const tagName = 'div';
const idGen = new IDGenerator('formfield_');

const getEventsTemplate = (attrs) => {
    const eventAttrs = new Map();
    attrs.forEach((value, key) => {
       if (key.endsWith('.event')) {
           eventAttrs.set(key, value);
           attrs.delete(key);
       }
    });
    return getAttrMarkup(eventAttrs);
};

const getWidgetTemplate = (attrs, widgetType, eventsTmpl, counter, pCounter, isMaxWidget?) => {
    let tmpl;
    const fieldName = attrs.get('key') || attrs.get('name');
    const formControl = isMaxWidget ? `formControlName="${fieldName}_max"` : `formControlName="${fieldName}"`;
    const defaultTmpl = `[class.hidden]="!${pCounter}.isUpdateMode && ${counter}.viewmodewidget !== 'default'" ${formControl} ${eventsTmpl}`;
    const tmplRef = isMaxWidget ? `#formWidgetMax` : `#formWidget`;
    const ngModelTmpl = isMaxWidget ? `[(ngModel)]="${counter}.maxValue"` : `[(ngModel)]="${counter}.datavalue"`;
    switch (widgetType) {
        case FormWidgetType.AUTOCOMPLETE:
        case FormWidgetType.TYPEAHEAD:
            tmpl = `<div wmSearch ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.CHECKBOX:
            tmpl = `<div wmCheckbox ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.CHECKBOXSET:
            tmpl = `<div wmCheckboxset ${defaultTmpl} ${tmplRef}></div>`;
            break;
        case FormWidgetType.CHIPS:
            /*TODO*/
            break;
        case FormWidgetType.COLORPICKER:
            tmpl = `<div wmColorPicker ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.CURRENCY:
            tmpl = `<div wmCurrency ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.DATE:
            tmpl = `<div wmDate ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.DATETIME:
            tmpl = `<div wmDateTime ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.NUMBER:
            tmpl = `<input wmText ${defaultTmpl} ${tmplRef}="wmText" type="number" ${ngModelTmpl} role="input">`;
            break;
        case FormWidgetType.PASSWORD:
            tmpl = `<input wmText ${defaultTmpl} ${tmplRef}="wmText" type="password" ${ngModelTmpl} role="input">`;
            break;
        case FormWidgetType.RADIOSET:
            tmpl = `<div wmRadioset ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.RATING:
            tmpl = `<div wmRating ${defaultTmpl} ${tmplRef}></div>`;
            break;
        case FormWidgetType.RICHTEXT:
            /*TODO*/
            break;
        case FormWidgetType.SELECT:
            tmpl = `<div wmSelect ${defaultTmpl} ${tmplRef}></div>`;
            break;
        case FormWidgetType.TOGGLE:
            tmpl = `<div wmCheckbox ${defaultTmpl} ${tmplRef} type="toggle"  role="input"></div>`;
            break;
        case FormWidgetType.SLIDER:
            tmpl = `<div wmSlider ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.SWITCH:
            tmpl = `<div wmSwitch ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.TEXT:
            tmpl = `<input wmText ${defaultTmpl} ${tmplRef}="wmText" type="${attrs.get('inputtype')}" ${ngModelTmpl} role="input">`;
            break;
        case FormWidgetType.TEXTAREA:
            tmpl = `<textarea wmTextarea ${defaultTmpl} ${tmplRef}="wmTextarea" ${ngModelTmpl} role="input"></textarea>`;
            break;
        case FormWidgetType.TIME:
            tmpl = `<div wmTime ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.TIMESTAMP:
            tmpl = `<div wmDateTime ${defaultTmpl} ${tmplRef} role="input"></div>`;
            break;
        case FormWidgetType.UPLOAD:
            /*TODO*/
            break;
        default:
            tmpl = `<input wmText ${defaultTmpl} ${tmplRef}="wmText" ${ngModelTmpl} role="input">`;
            break;
    }
    return tmpl;
};


const getTemplate = (attrs, widgetType, eventsTmpl, counter, pCounter) => {
        if (attrs.get('is-range') !== 'true') {
            return getWidgetTemplate(attrs, widgetType, eventsTmpl, counter, pCounter);
        }
        // TODO: Handle mobile case
        return `<div class="col-sm-6">${getWidgetTemplate(attrs, widgetType, eventsTmpl, counter, pCounter)}</div>
                <div class="col-sm-6">${getWidgetTemplate(attrs, widgetType, eventsTmpl, counter, pCounter, true)}</div>`;
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

const registerFormField = (isFormField): IBuildTaskDef => {
    return {
        requires: ['wm-form', 'wm-liveform', 'wm-livefilter'],
        pre: (attrs, shared, parentForm, parentLiveForm, parentFilter) => {
            const counter = idGen.nextUid();
            const parent = parentForm || parentLiveForm || parentFilter;
            const pCounter = parent.get('form_reference');
            const widgetType = attrs.get('widget') || FormWidgetType.TEXT;
            const dataRole = isFormField ? 'form-field' : 'filter-field';
            const validationMsg = isFormField ? `<p *ngIf="${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode"
                                   class="help-block text-danger"
                                   [textContent]="${counter}.validationmessage"></p>` : '';
            const eventsTmpl = getEventsTemplate(attrs);
            attrs.delete('widget');
            shared.set('counter', counter);
            return `<${tagName} data-role="${dataRole}" wmFormField #${counter}="wmFormField" widgettype="${widgetType}" [class.hidden]="!${counter}.show" ${getAttrMarkup(attrs)}>
                        <div class="live-field form-group app-composite-widget clearfix caption-{{${pCounter}.captionposition}}" widget="${widgetType}">
                            <label *ngIf="${counter}.displayname" class="app-label control-label formfield-label {{${pCounter}._captionClass}}" [title]="${counter}.displayname"
                                        [ngStyle]="{width: ${pCounter}.captionsize}" [ngClass]="{'text-danger': ${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode,
                                         required: ${pCounter}.isUpdateMode && ${counter}.required}" [textContent]="${counter}.displayname"> </label>
                            <div [ngClass]="[${pCounter}._widgetClass, ${counter}.class]">
                                 <label class="form-control-static app-label"
                                       [hidden]="${pCounter}.isUpdateMode || ${counter}.viewmodewidget === 'default'" [innerHTML]="${getCaptionByWidget(attrs, widgetType, counter)}"></label>
                                ${getTemplate(attrs, widgetType, eventsTmpl, counter, pCounter)}
                                <p *ngIf="!(${counter}._control?.invalid && ${counter}._control?.touched) && ${pCounter}.isUpdateMode"
                                   class="help-block" [textContent]="${counter}.hint"></p>
                                ${validationMsg}
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
};

register('wm-form-field', registerFormField.bind(this, true));
register('wm-filter-field', registerFormField.bind(this, false));

export default () => {};
