import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { FormWidgetType, getFormWidgetTemplate, IDGenerator, isMobileApp } from '@wm/core';

import { ALLFIELDS } from '../../../../utils/data-utils';
import { isDataSetWidget } from '../../../../utils/widget-utils';

const tagName = 'div';
const idGen = new IDGenerator('formfield_');

const getEventsTemplate = (attrs) => {
    const eventAttrs = new Map();
    if (!attrs.has('focus.event')) {
        attrs.set('focus.event', '');
    }
    if (!attrs.has('blur.event')) {
        attrs.set('blur.event', '');
    }
    attrs.forEach((value, key) => {
       if (key.endsWith('.event')) {
           if (key === 'focus.event') {
               value = `_onFocusField($event);${value}`;
           } else if (key === 'blur.event') {
               value = `_onBlurField($event);${value}`;
           }
           eventAttrs.set(key, value);
           attrs.delete(key);
       }
    });
    return getAttrMarkup(eventAttrs);
};

const DEFAULT_PLACEHOLDERS = new Map([
    [FormWidgetType.SELECT, ['Select Min value', 'Select Max value', 'Select value']],
    [FormWidgetType.DATETIME, ['Select Min date time', 'Select Max date time', 'Select date time']],
    [FormWidgetType.TIME, ['Select Min time', 'Select Max time', 'Select time']],
    [FormWidgetType.DATE, ['Select Min date', 'Select Max date', 'Select date']],
    [FormWidgetType.TEXTAREA, ['', '', 'Enter value']],
    [FormWidgetType.RICHTEXT, ['', '', 'Enter value']],
    [FormWidgetType.COLORPICKER, ['Select Color', 'Select Color', 'Select Color']],
    [FormWidgetType.CHIPS, ['', '', 'Type here...']],
    [FormWidgetType.PASSWORD, ['Enter Min value', 'Enter Max value', 'Enter value']],
    [FormWidgetType.NUMBER, ['Enter Min value', 'Enter Max value', 'Enter value']],
    [FormWidgetType.TEXT, ['Enter Min value', 'Enter Max value', 'Enter value']],
    [FormWidgetType.CURRENCY, ['Enter Min value', 'Enter Max value', 'Enter value']],
    [FormWidgetType.AUTOCOMPLETE, ['', '', 'Search']],
]);

const setDefaultPlaceholder = (attrs, widgetType, index) => {
    const prop = index === 1 ? 'maxplaceholder' : 'placeholder';
    let placeholder = attrs.get(prop);
    if (placeholder || placeholder === '') {
        return;
    }
    placeholder = DEFAULT_PLACEHOLDERS.get(widgetType) && DEFAULT_PLACEHOLDERS.get(widgetType)[index];
    if (placeholder) {
        attrs.set(prop, placeholder);
    }
};

const getWidgetTemplate = (attrs, options) => {
    const fieldName = (attrs.get('key') || attrs.get('name') || '').trim();
    const formControl = options.isMaxWidget ? `formControlName="${fieldName}_max"` : `formControlName="${fieldName}"`;
    const tmplRef = options.isMaxWidget ? `#formWidgetMax` : `#formWidget`;
    const defaultTmpl = `[class.hidden]="!${options.pCounter}.isUpdateMode && ${options.counter}.viewmodewidget !== 'default'" ${formControl} ${options.eventsTmpl} ${tmplRef}`;
    return getFormWidgetTemplate(options.widgetType, defaultTmpl, attrs, {counter: options.counter, pCounter: options.pCounter});
};


const getTemplate = (attrs, widgetType, eventsTmpl, counter, pCounter) => {
    const isRange = attrs.get('is-range') === 'true';
    if (!isRange) {
        return getWidgetTemplate(attrs, {widgetType, eventsTmpl, counter, pCounter});
    }
    const layoutClass = isMobileApp() ? 'col-xs-6' : 'col-sm-6';
    return `<div class="${layoutClass}">${getWidgetTemplate(attrs, {widgetType, eventsTmpl, counter, pCounter})}</div>
                <div class="${layoutClass}">${getWidgetTemplate(attrs, {widgetType, eventsTmpl, counter, pCounter, isMaxWidget: true})}</div>`;
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
            const pCounter = (parent && parent.get('form_reference')) || 'form';
            const widgetType = attrs.get('widget') || FormWidgetType.TEXT;
            const dataRole = isFormField ? 'form-field' : 'filter-field';
            const validationMsg = isFormField ? `<p *ngIf="${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode"
                                   class="help-block text-danger"
                                   [textContent]="${counter}.validationmessage"></p>` : '';
            const eventsTmpl = getEventsTemplate(attrs);
            const controlLayout = isMobileApp() ? 'col-xs-12' : 'col-sm-12';
            attrs.delete('widget');
            shared.set('counter', counter);

            if (attrs.get('is-range') === 'true') {
                setDefaultPlaceholder(attrs, widgetType, 0);
                setDefaultPlaceholder(attrs, widgetType, 1);
            } else {
                setDefaultPlaceholder(attrs, widgetType, 2);
            }

            return `<${tagName} data-role="${dataRole}" [formGroup]="${pCounter}.ngform" wmFormField #${counter}="wmFormField" widgettype="${widgetType}" ${getAttrMarkup(attrs)}>
                        <div class="live-field form-group app-composite-widget clearfix caption-{{${pCounter}.captionposition}}" widget="${widgetType}">
                            <label *ngIf="${counter}.displayname" class="app-label control-label formfield-label {{${pCounter}._captionClass}}" [title]="${counter}.displayname"
                                        [ngStyle]="{width: ${pCounter}.captionsize}" [ngClass]="{'text-danger': ${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode,
                                         required: ${pCounter}.isUpdateMode && ${counter}.required}" [textContent]="${counter}.displayname"> </label>
                            <div [ngClass]="${counter}.displayname ? ${pCounter}._widgetClass : '${controlLayout}'">
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
