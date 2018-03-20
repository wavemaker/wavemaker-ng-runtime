import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';
import { idMaker } from '@utils/utils';

const tagName = 'div';
const idGen = idMaker('formfield_');

const getWidgetTemplate = (attrs, pCounter) => {
    let tmpl;
    const fieldName = attrs.get('name') || attrs.get('key');
    const defaultTmpl = `*ngIf="${pCounter}.isUpdateMode" formControlName="${fieldName}"`;
    switch (attrs.get('widget')) {
        case 'number':
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText" type="number" >`;
            break;
        case 'text':
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText" type="${attrs.get('inputtype')}">`;
            break;
        case 'password':
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText" type="password">`;
            break;
        case 'select':
            tmpl = `<div wmSelect ${defaultTmpl} #formWidget></div>`;
            break;
        case 'checkbox':
            tmpl = `<div wmCheckbox ${defaultTmpl} #formWidget></div>`;
            break;
        case 'toggle':
            tmpl = `<div wmCheckbox ${defaultTmpl} #formWidget type="toggle"></div>`;
            break;
        case 'checkboxset':
            tmpl = `<div wmCheckbox ${defaultTmpl} #formWidget></div>`;
            break;
        case 'radioset':
            tmpl = `<div wmRadioSet ${defaultTmpl} #formWidget></div>`;
            break;
        case 'slider':
            tmpl = `<div wmSlider ${defaultTmpl} #formWidget></div>`;
            break;
        case 'colorpicker':
            tmpl = `<div wmColorPicker ${defaultTmpl} #formWidget></div>`;
            break;
        case 'chips':
            /*TODO*/
            break;
        case 'richtext':
            /*TODO*/
            break;
        case 'textarea':
            tmpl = `<textarea wmTextarea ${defaultTmpl} #formWidget="wmTextarea" ngModel></texarea>`;
            break;
        case 'upload':
            /*TODO*/
            break;
        case 'date':
            tmpl = `<div wmDate ${defaultTmpl} #formWidget></div>`;
            break;
        case 'time':
            tmpl = `<div wmTime ${defaultTmpl} #formWidget></div>`;
            break;
        case 'datetime':
            tmpl = `<div wmDateTime ${defaultTmpl} #formWidget></div>`;
            break;
        case 'timestamp':
            tmpl = `<div wmDateTime ${defaultTmpl} #formWidget></div>`;
            break;
        case 'rating':
            tmpl = `<div wmRating ${defaultTmpl} #formWidget></div>`;
            break;
        case 'switch':
            tmpl = `<div wmSwitch ${defaultTmpl} #formWidget></div>`;
            break;
        case 'currency':
            tmpl = `<div wmCurrency ${defaultTmpl} #formWidget></div>`;
            break;
        case 'typeahead':
        case 'autocomplete':
            /*TODO*/
            break;
        default:
            tmpl = `<input wmText ${defaultTmpl} #formWidget="wmText">`;
            break;
    }
    return tmpl;
};

register('wm-form-field', (): BuildTaskDef => {
    return {
        requires: 'wm-form',
        pre: (attrs, shared, parentForm) => {
            const counter = idGen.next().value;
            const pCounter = parentForm.get('form_reference');
            shared.set('counter', counter);
            return `<${tagName} data-role="form-field" wmFormField #${counter}="wmFormField" widgettype="${attrs.get('widget')}" ${getAttrMarkup(attrs)}>
                        <div class="live-field form-group app-composite-widget clearfix caption-{{${pCounter}.captionposition}}" widget="text">
                            <div [ngClass]="[${pCounter}._widgetClass, ${counter}.class]">
                                 <label *ngIf="${counter}.displayname" class="app-label control-label formfield-label {{${pCounter}._captionClass}}" [title]="${counter}.displayname"
                                        [ngStyle]="{width: ${pCounter}.captionsize}" [ngClass]="{'text-danger': ${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode,
                                         required: ${pCounter}.isUpdateMode && ${counter}.required}" [textContent]="${counter}.displayname"> </label>
                                 <label class="form-control-static app-label" [textContent]="value"
                                       [hidden]="${pCounter}.isUpdateMode || viewmodewidget === 'default'"></label>
                                ${getWidgetTemplate(attrs, pCounter)}
                                <p *ngIf="!(${counter}._control?.invalid && ${counter}._control?.touched) && ${pCounter}.isUpdateMode"
                                   class="help-block" [textContent]="${counter}.hint"></p>
                                <p *ngIf="${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode"
                                   class="help-block text-danger"
                                   [textContent]="${counter}.validationmessage"></p>
                            </div>
                        </div>`;
        },
        post: () => {
            return `</${tagName}>`;
        },
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
});

export default () => {};
