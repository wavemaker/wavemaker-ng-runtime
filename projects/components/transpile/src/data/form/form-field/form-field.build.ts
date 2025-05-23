import {getFormMarkupAttr, IBuildTaskDef, register} from '@wm/transpiler';
import {
    FormWidgetType,
    generateGUId,
    getFormWidgetTemplate,
    getRequiredFormWidget,
    IDGenerator
} from '@wm/core';

import {ALLFIELDS, isDataSetWidget} from '../../../utils/utils';
import {forEach} from "lodash-es";

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
    return getFormMarkupAttr(eventAttrs);
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
    let customAttrs = ``;
    if(options.widgetType === "custom-widget") {
        for (let [key, value] of attrs) {
            if(key.startsWith('prop-'))
                customAttrs += key + '="' + value + '" ';
        }
    }
    const name = attrs.get('name');
    const customWidgetName = attrs.get('widgetname');
    const fieldName = (attrs.get('key') || name || '').trim();
    const formControl = options.isMaxWidget ? `formControlName="${fieldName}_max"` : (options.isInList ? `[formControlName]="${options.counter}._fieldName"` : `formControlName="${fieldName}"`);
    const tmplRef = options.isMaxWidget ? `#formWidgetMax` : `#formWidget`;
    const widgetName = name ? (options.isMaxWidget ? `name="${name}_formWidgetMax"` : `name="${name}_formWidget"`) : '';
    const conditionalClass = `[ngClass]="${attrs.get('ngclass')}"`;
    const defaultTmpl = `[class.hidden]="!${options.pCounter}.isUpdateMode && ${options.counter}.viewmodewidget !== 'default'" ${formControl} ${options.eventsTmpl} ${conditionalClass} ${tmplRef} ${widgetName} ${customWidgetName ? `widgetname=${customWidgetName} ${customAttrs}`:''}` ;
    return getFormWidgetTemplate(options.widgetType, defaultTmpl, attrs, {counter: options.counter, pCounter: options.pCounter});
};


const getTemplate = (attrs, widgetType, eventsTmpl, counter, pCounter, isInList) => {
    const isRange = attrs.get('is-range') === 'true';
    if (!isRange) {
        return getWidgetTemplate(attrs, {widgetType, eventsTmpl, counter, pCounter, isInList});
    }
    const layoutClass = 'col-sm-6';
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
        caption += ` | toDate:${counter}.formWidget.datepattern || 'yyyy-MM-dd hh:mm:ss a'`;
        return caption;
    }
    if (widgetType === FormWidgetType.TIME) {
        caption += ` | toDate:${counter}.formWidget.timepattern || 'hh:mm a'`;
        return caption;
    }
    if (widgetType === FormWidgetType.DATE) {
        caption += ` | toDate:${counter}.formWidget.datepattern ||  'yyyy-MMM-dd'`;
        return caption;
    }
    if (widgetType === FormWidgetType.RATING || widgetType === FormWidgetType.UPLOAD) {
        return '';
    }
    if (isDataSetWidget(widgetType) && attrs.get('datafield') === ALLFIELDS) {
        return `${counter}.getDisplayExpr()`;
    }
    return `${counter}.getCaption()`;
};

const registerFormField = (isFormField): IBuildTaskDef => {
    return {
        requires: ['wm-form', 'wm-liveform', 'wm-livefilter', 'wm-list'],
        pre: (attrs, shared, parentForm, parentLiveForm, parentFilter, parentList) => {
            const counter = idGen.nextUid();
            const parent = parentForm || parentLiveForm || parentFilter;
            const pCounter = (parent && parent.get('form_reference')) || 'form';
            const widgetType = attrs.get('widget') || FormWidgetType.TEXT;
            const dataRole = isFormField ? 'form-field' : 'filter-field';
            const formFieldErrorMsgId = 'wmform-field-error-' + generateGUId();
            const validationMsg = `@if (${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode) {
                                                  <p class="help-block text-danger" aria-hidden="false" role="alert" aria-live="assertive" [attr.aria-label]="${counter}.validationmessage" id="${formFieldErrorMsgId}">
                                                    <span aria-hidden="true" [textContent]="${counter}.validationmessage"></span>
                                                  </p>}`;
            const eventsTmpl = widgetType === FormWidgetType.UPLOAD ? '' : getEventsTemplate(attrs);
            const controlLayout = 'col-sm-12';
            const isInList = pCounter === (parentList && parentList.get('parent_form_reference'));
            attrs.set('__validationId', formFieldErrorMsgId);
            attrs.set('__widgetType', widgetType);
            attrs.delete('widget');
            shared.set('counter', counter);

            if (attrs.get('is-range') === 'true') {
                setDefaultPlaceholder(attrs, widgetType, 0);
                setDefaultPlaceholder(attrs, widgetType, 1);
            } else {
                setDefaultPlaceholder(attrs, widgetType, 2);
            }

            return `<${tagName} data-role="${dataRole}" [formGroup]="${pCounter}.ngform" wmFormField wmCaptionPosition #${counter}="wmFormField" widgettype="${widgetType}" ${getFormMarkupAttr(attrs)}>
                        <div class="live-field form-group app-composite-widget clearfix caption-{{${pCounter}.captionposition}}" widget="${widgetType}">
                            <label [hidden]="!${counter}.displayname" class="app-label control-label formfield-label {{${pCounter}._captionClass}}"
                                        [ngStyle]="{width: ${pCounter}.captionsize}" [ngClass]="{'text-danger': ${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode,
                                         required: ${pCounter}.isUpdateMode && ${counter}.required}" [textContent]="${counter}.displayname"> </label>
                            <div [ngClass]="${counter}.displayname ? ${pCounter}._widgetClass : '${controlLayout}'">
                                 <span class="form-control-static app-label"
                                       [hidden]="${pCounter}.isUpdateMode || ${counter}.viewmodewidget === 'default' || ${counter}.widgettype === 'upload'" [innerHTML]="${getCaptionByWidget(attrs, widgetType, counter)}"></span>
                                ${getTemplate(attrs, widgetType, eventsTmpl, counter, pCounter, isInList)}
                                @if(${counter}.showPendingSpinner){ <span aria-hidden="true" class="form-field-spinner fa fa-circle-o-notch fa-spin form-control-feedback"></span>}
                                @if(!(${counter}._control?.invalid && ${counter}._control?.touched) && ${pCounter}.isUpdateMode){ <p class="help-block" aria-hidden="true" role="alert" aria-live="polite" [textContent]="${counter}.hint"></p> }
                                ${validationMsg}
                            </div>
                        </div>`;
        },
        post: () => `</${tagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        },
        imports: (attrs: Map<String, String>): string[] => {
            const requiredWidget = getRequiredFormWidget(attrs.get('__widgetType') || attrs.get('type'));
            attrs.delete('__widgetType');
            return [requiredWidget, 'wm-form'];
        }
    };
};

register('wm-form-field', registerFormField.bind(this, true));
register('wm-filter-field', registerFormField.bind(this, false));

export default () => {};
