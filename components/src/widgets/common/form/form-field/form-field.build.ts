import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { FormWidgetType, IDGenerator } from '@wm/core';

import { ALLFIELDS } from '../../../../utils/data-utils';
import { isDataSetWidget } from '../../../../utils/widget-utils';

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
    const tmplRef = isMaxWidget ? `#formWidgetMax` : `#formWidget`;
    const defaultTmpl = `[class.hidden]="!${pCounter}.isUpdateMode && ${counter}.viewmodewidget !== 'default'" ${formControl} ${eventsTmpl} ${tmplRef}`;
    switch (widgetType) {
        case FormWidgetType.AUTOCOMPLETE:
        case FormWidgetType.TYPEAHEAD:
            tmpl = `<div wmSearch ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOX:
            tmpl = `<div wmCheckbox ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOXSET:
            tmpl = `<div wmCheckboxset ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.CHIPS:
            /*TODO*/
            break;
        case FormWidgetType.COLORPICKER:
            tmpl = `<div wmColorPicker ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.CURRENCY:
            tmpl = `<div wmCurrency ${defaultTmpl}}></div>`;
            break;
        case FormWidgetType.DATE:
            tmpl = `<div wmDate ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.DATETIME:
            tmpl = `<div wmDateTime ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.NUMBER:
            tmpl = `<div wmInput ${defaultTmpl} type="number" aria-label="Only numbers"></div>`;
            break;
        case FormWidgetType.PASSWORD:
            tmpl = `<div wmInput ${defaultTmpl} type="password" aria-label="Enter password" displayformat="${attrs.get('displayformat')}"></div>`;
            break;
        case FormWidgetType.RADIOSET:
            tmpl = `<div wmRadioset ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.RATING:
            tmpl = `<div wmRating ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.RICHTEXT:
            /*TODO*/
            break;
        case FormWidgetType.SELECT:
            tmpl = `<div wmSelect ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.TOGGLE:
            tmpl = `<div wmCheckbox ${defaultTmpl} type="toggle" role="checkbox" aria-label="Toggle button"></div>`;
            break;
        case FormWidgetType.SLIDER:
            tmpl = `<div wmSlider ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.SWITCH:
            tmpl = `<div wmSwitch ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.TEXT:
            tmpl = `<div wmInput ${defaultTmpl} type="${attrs.get('inputtype') || 'text'}" aria-describedby="Enter text" displayformat="${attrs.get('displayformat')}"></div>`;
            break;
        case FormWidgetType.TEXTAREA:
            tmpl = `<div wmTextarea ${defaultTmpl} role="textbox" aria-describedby="Place your text"></div>`;
            break;
        case FormWidgetType.TIME:
            tmpl = `<div wmTime ${defaultTmpl}></div>`;
            break;
        case FormWidgetType.TIMESTAMP:
            tmpl = `<div wmDateTime ${defaultTmpl} role="input"></div>`;
            break;
        case FormWidgetType.UPLOAD:
            tmpl = `<a class="form-control-static" href="{{${counter}.href}}" target="_blank" *ngIf="${counter}.filetype === 'image' && ${counter}.href">
                        <img style="height:2em" class="wi wi-file" [src]="${counter}.href"/></a>
                        <a class="form-control-static" target="_blank" href="{{${counter}.href}}" *ngIf="${counter}.filetype !== 'image' && ${counter}.href">
                        <i class="wi wi-file"></i></a>
                        <input ${defaultTmpl} class="app-blob-upload" [ngClass]="{'file-readonly': ${counter}.readonly}"
                        [required]="${counter}.required" type="file" name="${fieldName}_formWidget" [readonly]="${counter}.readonly"
                        [class.hidden]="!${pCounter}.isUpdateMode" [(ngModel)]="${counter}.value" [accept]="${counter}.permitted">`;
            break;
        default:
            tmpl = `<div wmInput ${defaultTmpl} aria-describedby="Enter text" type="text" displayformat="${attrs.get('displayformat')}"></div>`;
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
                            <div [ngClass]="[${pCounter}._widgetClass]">
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
