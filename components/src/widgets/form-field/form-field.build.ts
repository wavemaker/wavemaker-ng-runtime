import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { idMaker } from '@wm/utils';
import { ALLFIELDS } from '../../utils/data-utils';
import { isDataSetWidget } from '../../utils/widget-utils';

const tagName = 'div';
const idGen = idMaker('formfield_');

const getWidgetTemplate = (attrs, widgetType, counter, pCounter) => {
    let tmpl;
    const fieldName = attrs.get('key') || attrs.get('name');
    const defaultTmpl = `[class.hidden]="!${pCounter}.isUpdateMode && ${counter}.viewmodewidget !== 'default'" formControlName="${fieldName}"`;
    switch (widgetType) {
        case 'autocomplete':
        case 'typeahead':
            tmpl = `<div wmSearch ${defaultTmpl} #formWidget></div>`;
            break;
        case 'checkbox':
            tmpl = `<div wmCheckbox ${defaultTmpl} #formWidget></div>`;
            break;
        case 'checkboxset':
            // tmpl = `<div wmCheckbox ${defaultTmpl} #formWidget></div>`;
            break;
        case 'chips':
            /*TODO*/
            break;
        case 'colorpicker':
            tmpl = `<div wmColorPicker ${defaultTmpl} #formWidget></div>`;
            break;
        case 'currency':
            tmpl = `<div wmCurrency ${defaultTmpl} #formWidget></div>`;
            break;
        case 'date':
            tmpl = `<div wmDate ${defaultTmpl} #formWidget></div>`;
            break;
        case 'datetime':
            tmpl = `<div wmDateTime ${defaultTmpl} #formWidget></div>`;
            break;
        case 'number':
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText" type="number" >`;
            break;
        case 'password':
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText" type="password">`;
            break;
        case 'radioset':
            tmpl = `<div wmRadioset ${defaultTmpl} #formWidget></div>`;
            break;
        case 'rating':
            tmpl = `<div wmRating ${defaultTmpl} #formWidget></div>`;
            break;
        case 'richtext':
            /*TODO*/
            break;
        case 'select':
            tmpl = `<div wmSelect ${defaultTmpl} #formWidget></div>`;
            break;
        case 'toggle':
            tmpl = `<div wmCheckbox ${defaultTmpl} #formWidget type="toggle"></div>`;
            break;
        case 'slider':
            tmpl = `<div wmSlider ${defaultTmpl} #formWidget></div>`;
            break;
        case 'switch':
            tmpl = `<div wmSwitch ${defaultTmpl} #formWidget></div>`;
            break;
        case 'text':
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText" type="${attrs.get('inputtype')}">`;
            break;
        case 'textarea':
            tmpl = `<textarea wmTextarea ${defaultTmpl} #formWidget="wmTextarea" ngModel></texarea>`;
            break;
        case 'time':
            tmpl = `<div wmTime ${defaultTmpl} #formWidget></div>`;
            break;
        case 'timestamp':
            tmpl = `<div wmDateTime ${defaultTmpl} #formWidget></div>`;
            break;
        case 'upload':
            /*TODO*/
            break;
        default:
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText">`;
            break;
    }
    return tmpl;
};

const getCaptionByWidget = (attrs, widgetType, counter) => {
    if (attrs.get('is-related') === 'true') {
        return `${counter}.getDisplayExpr()`;
    }
    if (widgetType === 'password') {
        return '\'********\'';
    }
    let caption = `${counter}.value`;
    if (widgetType === 'datetime' || widgetType === 'timestamp') {
        caption += ` | toDate:${counter}.datepattern || 'yyyy-MM-dd hh:mm:ss a'`;
    } else if (widgetType === 'time') {
        caption += ` | toDate:${counter}.timepattern || 'hh:mm a'`;
    } else if (widgetType === 'date') {
        caption += ` | toDate:${counter}.datepattern ||  'yyyy-MMM-dd'`;
    } else if (widgetType === 'rating' || widgetType === 'upload') {
        caption = '';
    } else if (isDataSetWidget(widgetType) && attrs.get('datafield') === ALLFIELDS) {
        return `${counter}.getDisplayExpr()`;
    }
    return caption;
};

register('wm-form-field', (): BuildTaskDef => {
    return {
        requires: ['wm-form', 'wm-liveform'],
        pre: (attrs, shared, parentForm, parentLiveForm) => {
            const counter = idGen.next().value;
            const parent = parentForm || parentLiveForm;
            const pCounter = parent.get('form_reference');
            const widgetType = attrs.get('widget');
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
