import { FormWidgetType } from '@wm/core';

// Method to get the form widget template
export const getFormWidgetTemplate = (widgetType: string, innerTmpl: string, attrs?: Map<string, string>, counter?: string, pCounter?: string) => {
    let tmpl;
    switch (widgetType) {
        case FormWidgetType.AUTOCOMPLETE:
        case FormWidgetType.TYPEAHEAD:
            tmpl = `<div wmSearch ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOX:
            tmpl = `<div wmCheckbox ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOXSET:
            tmpl = `<ul wmCheckboxset ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.CHIPS:
            /*TODO*/
            break;
        case FormWidgetType.COLORPICKER:
            tmpl = `<div wmColorPicker ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CURRENCY:
            tmpl = `<div wmCurrency ${innerTmpl}}></div>`;
            break;
        case FormWidgetType.DATE:
            tmpl = `<div wmDate ${innerTmpl}></div>`;
            break;
        case FormWidgetType.DATETIME:
            tmpl = `<div wmDateTime ${innerTmpl}></div>`;
            break;
        case FormWidgetType.NUMBER:
            tmpl = `<wm-input ${innerTmpl} type="number" aria-label="Only numbers"></wm-input>`;
            break;
        case FormWidgetType.PASSWORD:
            tmpl = `<wm-input ${innerTmpl} type="password" aria-label="Enter password"></wm-input>`;
            break;
        case FormWidgetType.RADIOSET:
            tmpl = `<ul wmRadioset ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.RATING:
            tmpl = `<div wmRating ${innerTmpl}></div>`;
            break;
        case FormWidgetType.RICHTEXT:
            /*TODO*/
            break;
        case FormWidgetType.SELECT:
            tmpl = `<wm-select ${innerTmpl}></wm-select>`;
            break;
        case FormWidgetType.TOGGLE:
            tmpl = `<div wmCheckbox ${innerTmpl} type="toggle" role="checkbox" aria-label="Toggle button"></div>`;
            break;
        case FormWidgetType.SLIDER:
            tmpl = `<div wmSlider ${innerTmpl}></div>`;
            break;
        case FormWidgetType.SWITCH:
            tmpl = `<div wmSwitch ${innerTmpl}></div>`;
            break;
        case FormWidgetType.TEXT:
            tmpl = `<wm-input ${innerTmpl} type="${attrs.get('inputtype') || 'text'}" aria-describedby="Enter text"></wm-input>`;
            break;
        case FormWidgetType.TEXTAREA:
            tmpl = `<wm-textarea ${innerTmpl} role="textbox" aria-describedby="Place your text"></wm-textarea>`;
            break;
        case FormWidgetType.TIME:
            tmpl = `<div wmTime ${innerTmpl}></div>`;
            break;
        case FormWidgetType.TIMESTAMP:
            tmpl = `<div wmDateTime ${innerTmpl} role="input"></div>`;
            break;
        case FormWidgetType.UPLOAD:
            tmpl = `<a class="form-control-static" href="{{${counter}.href}}" target="_blank" *ngIf="${counter}.filetype === 'image' && ${counter}.href">
                        <img style="height:2em" class="wi wi-file" [src]="${counter}.href"/></a>
                        <a class="form-control-static" target="_blank" href="{{${counter}.href}}" *ngIf="${counter}.filetype !== 'image' && ${counter}.href">
                        <i class="wi wi-file"></i></a>
                        <input ${innerTmpl} class="app-blob-upload" [ngClass]="{'file-readonly': ${counter}.readonly}"
                        [required]="${counter}.required" type="file" name="${attrs.get('key') || attrs.get('name')}_formWidget" [readonly]="${counter}.readonly"
                        [class.hidden]="!${pCounter}.isUpdateMode" [(ngModel)]="${counter}.value" [accept]="${counter}.permitted">`;
            break;
        default:
            tmpl = `<wm-input ${innerTmpl} aria-describedby="Enter text" type="text"></wm-input>`;
            break;
    }
    return tmpl;
};
