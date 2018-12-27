import { Element } from '@angular/compiler';

import { FormWidgetType } from '../enums/enums';

declare const _;

// Method to get the form widget template
export const getFormWidgetTemplate = (widgetType: string, innerTmpl: string, attrs?: Map<string, string>, options: any = {}) => {
    let tmpl;
    const updateOn = attrs.get('updateon');
    const updateOnTmpl = updateOn ? `updateon="${updateOn}"` : '';
    switch (widgetType) {
        case FormWidgetType.AUTOCOMPLETE:
        case FormWidgetType.TYPEAHEAD:
            tmpl = `<div wmSearch type="autocomplete" ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOX:
            tmpl = `<div wmCheckbox ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOXSET:
            tmpl = `<ul wmCheckboxset ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.CHIPS:
            tmpl = `<ul wmChips role="input" ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.COLORPICKER:
            tmpl = `<div wmColorPicker ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CURRENCY:
            tmpl = `<div wmCurrency ${innerTmpl}></div>`;
            break;
        case FormWidgetType.DATE:
            tmpl = `<div wmDate ${innerTmpl}></div>`;
            break;
        case FormWidgetType.DATETIME:
            tmpl = `<div wmDateTime ${innerTmpl}></div>`;
            break;
        case FormWidgetType.NUMBER:
            tmpl = `<div wmNumber ${innerTmpl} type="number" aria-label="Only numbers" ${updateOnTmpl}></div>`;
            break;
        case FormWidgetType.PASSWORD:
            tmpl = `<wm-input ${innerTmpl} type="password" aria-label="Enter password" ${updateOnTmpl}></wm-input>`;
            break;
        case FormWidgetType.RADIOSET:
            tmpl = `<ul wmRadioset ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.RATING:
            tmpl = `<div wmRating ${innerTmpl}></div>`;
            break;
        case FormWidgetType.RICHTEXT:
            tmpl = `<div wmRichTextEditor role="textbox" ${innerTmpl}></div>`;
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
            tmpl = `<wm-input ${innerTmpl} type="${attrs.get('inputtype') || 'text'}" aria-describedby="Enter text" ${updateOnTmpl}></wm-input>`;
            break;
        case FormWidgetType.TEXTAREA:
            tmpl = `<wm-textarea ${innerTmpl} role="textbox" aria-describedby="Place your text" ${updateOnTmpl}></wm-textarea>`;
            break;
        case FormWidgetType.TIME:
            tmpl = `<div wmTime ${innerTmpl}></div>`;
            break;
        case FormWidgetType.TIMESTAMP:
            tmpl = `<div wmDateTime ${innerTmpl} role="input"></div>`;
            break;
        case FormWidgetType.UPLOAD:
            const counter = options.counter;
            const pCounter = options.pCounter;
            const uploadProps = options.uploadProps;
            if (uploadProps) {
                tmpl = `<form name="${uploadProps.formName}" ${innerTmpl}>
                            <input focus-target class="file-upload" type="file" name="${uploadProps.name}"/>
                        </form>`;
            } else {
                tmpl = `<a class="form-control-static" href="{{${counter}.href}}" target="_blank" *ngIf="${counter}.filetype === 'image' && ${counter}.href">
                        <img style="height:2em" class="wi wi-file" [src]="${counter}.href"/></a>
                        <a class="form-control-static" target="_blank" href="{{${counter}.href}}" *ngIf="${counter}.filetype !== 'image' && ${counter}.href">
                        <i class="wi wi-file"></i></a>
                        <input ${innerTmpl} class="app-blob-upload" [ngClass]="{'file-readonly': ${counter}.readonly}"
                        [required]="${counter}.required" type="file" name="${attrs.get('key') || attrs.get('name')}_formWidget" [readonly]="${counter}.readonly"
                        [class.hidden]="!${pCounter}.isUpdateMode" [accept]="${counter}.permitted">`;
            }
            break;
        default:
            tmpl = `<wm-input ${innerTmpl} aria-describedby="Enter text" type="text" ${updateOnTmpl}></wm-input>`;
            break;
    }
    return tmpl;
};

// The bound value is replaced with {{item.fieldname}} here. This is needed by the liveList when compiling inner elements
export const updateTemplateAttrs = (rootNode: Element | Array<Element>, parentDataSet: string, widgetName: string, instance: string = '') => {

    const regex = new RegExp('(' + parentDataSet + ')(\\[0\\])?(.data\\[\\$i\\])?(.content\\[\\$i\\])?(\\[\\$i\\])?', 'g');
    let currentItemRegEx;
    let currentItemWidgetsRegEx;
    let nodes: Array<Element>;

    if (widgetName) {
        currentItemRegEx = new RegExp(`(Widgets.${widgetName}.currentItem)\\b`, 'g');
        currentItemWidgetsRegEx = new RegExp(`(Widgets.${widgetName}.currentItemWidgets)\\b`, 'g');
    }

    if (!_.isArray(rootNode)) {
        nodes = [rootNode as Element];
    } else {
        nodes = rootNode as Array<Element>;
    }

    nodes.forEach((childNode: Element) => {
        if (childNode.name) {
            childNode.attrs.forEach((attr) => {
                // trim the extra spaces in bindings
                let value = attr.value && attr.value.trim();
                if (_.startsWith(value, 'bind:')) {
                    // if the attribute value is "bind:xxxxx.xxxx", either the dataSet/scopeDataSet has to contain "xxxx.xxxx"
                    if (_.includes(value, parentDataSet) && value !== 'bind:' + parentDataSet) {
                        value = value.replace('bind:', '');
                        value = value.replace(regex, 'item');
                        value = 'bind:' + value;
                    }
                    // Replace item if widget property is bound to livelist currentItem
                    if (currentItemRegEx && currentItemRegEx.test(value)) {
                        value = value.replace(currentItemRegEx, 'item');
                    }
                    if (currentItemWidgetsRegEx && currentItemWidgetsRegEx.test(value)) {
                        value = value.replace(currentItemWidgetsRegEx, `${instance}currentItemWidgets`);
                    }

                    attr.value = value;
                }
            });
            updateTemplateAttrs(childNode.children as Array<Element>, parentDataSet, widgetName, instance);
        }
    });
};

// If formControlName attribute is present, dont add the ngModel
export const getNgModelAttr = attrs => {
    if (attrs.has('formControlName') || attrs.has('formControlName.bind')) {
        return '';
    }
    return 'ngModel';
};

const rowActionAttrs = new Map(
    [
        ['display-name', 'caption'],
        ['display-name.bind', 'caption.bind'],
        ['title', 'hint'],
        ['title.bind', 'hint.bind'],
        ['show', 'show'],
        ['show.bind', 'show.bind'],
        ['disabled', 'disabled'],
        ['disabled.bind', 'disabled.bind'],
        ['hyperlink', 'hyperlink'],
        ['target', 'target']
    ]
);

export const getRowActionAttrs = attrs => {
    let tmpl = '';
    attrs.forEach((val, key) => {
        const newAttr = rowActionAttrs.get(key);
        if (newAttr) {
            tmpl += `${newAttr}="${val}" `;
        }
    });
    return tmpl;
};
