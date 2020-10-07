import { Attribute, Element } from '@angular/compiler';

import { FormWidgetType } from '../enums/enums';

declare const _;

// For html upload widget, add events on input tag
const getUploadEventTmpl = (attrs, counter?, fieldName?) => {
    let eventTmpl = '';
    attrs.forEach((val, key) => {
       if (key && key.endsWith('.event')) {
           const eventName = key.split('.')[0];
           const counterTl = counter ? `${counter}.` : '';
           eventTmpl = ` ${eventTmpl} (${eventName})="${counterTl}triggerUploadEvent($event, '${eventName}', '${fieldName}', row)" `;
       }
    });
    return eventTmpl;
};

// Method to get the form widget template
export const getFormWidgetTemplate = (widgetType: string, innerTmpl: string, attrs?: Map<string, string>, options: any = {}) => {
    let tmpl;
    const updateOn = attrs.get('updateon');
    const updateOnTmpl = updateOn ? `updateon="${updateOn}"` : '';
    switch (widgetType) {
        case FormWidgetType.AUTOCOMPLETE:
        case FormWidgetType.TYPEAHEAD:
            tmpl = `<div wmSearch type="autocomplete" debouncetime="${attrs.get('debouncetime')}" ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOX:
            tmpl = `<div wmCheckbox ${innerTmpl} ${attrs.get('required')==='true' ? 'required=true' : ''}></div>`;
            break;
        case FormWidgetType.CHECKBOXSET:
            tmpl = `<ul wmCheckboxset ${innerTmpl} ${attrs.get('required')==='true' ? 'required=true' : ''}></ul>`;
            break;
        case FormWidgetType.CHIPS:
            tmpl = `<ul wmChips role="input" debouncetime="${attrs.get('debouncetime')}" ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.COLORPICKER:
            tmpl = `<div wmColorPicker ${attrs.get('required')==='true' ? 'required=true' : ''} ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CURRENCY:
            tmpl = `<div wmCurrency ${attrs.get('required')==='true' ? 'required=true' : ''} ${innerTmpl}></div>`;
            break;
        case FormWidgetType.DATE:
            tmpl = `<div wmDate ${attrs.get('required')==='true' ? 'required=true' : ''} dataentrymode="${attrs.get('dataentrymode')}" ${innerTmpl}></div>`;
            break;
        case FormWidgetType.DATETIME:
            tmpl = `<div wmDateTime ${attrs.get('required')==='true' ? 'required=true' : ''} dataentrymode="${attrs.get('dataentrymode')}" ${innerTmpl}></div>`;
            break;
        case FormWidgetType.NUMBER:
            tmpl = `<div wmNumber ${innerTmpl} ${attrs.get('required')==='true' ? 'required=true' : ''} type="number" aria-label="Only numbers" ${updateOnTmpl}></div>`;
            break;
        case FormWidgetType.PASSWORD:
            tmpl = `<wm-input ${innerTmpl} ${attrs.get('required')==='true' ? 'required=true' : ''} type="password" aria-label="Enter password" ${updateOnTmpl}></wm-input>`;
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
            tmpl = `<wm-select ${attrs.get('required')==='true' ? 'required=true' : ''} ${innerTmpl}></wm-select>`;
            break;
        case FormWidgetType.TOGGLE:
            tmpl = `<div wmCheckbox ${innerTmpl} ${attrs.get('required')==='true' ? 'required=true' : ''} type="toggle" role="checkbox" aria-label="Toggle button"></div>`;
            break;
        case FormWidgetType.SLIDER:
            tmpl = `<div wmSlider ${innerTmpl}></div>`;
            break;
        case FormWidgetType.SWITCH:
            tmpl = `<div wmSwitch ${innerTmpl}></div>`;
            break;
        case FormWidgetType.TEXT:
            const inputType = options.inputType || 'inputtype';
            tmpl = `<wm-input ${innerTmpl}  ${attrs.get('required')==='true' ? 'required=true' : ''} type="${attrs.get(inputType) || 'text'}" aria-describedby="Enter text" ${updateOnTmpl}></wm-input>`;
            break;
        case FormWidgetType.TEXTAREA:
            tmpl = `<wm-textarea ${innerTmpl} ${attrs.get('required')==='true' ? 'required=true' : ''} role="textbox" aria-describedby="Place your text" ${updateOnTmpl}></wm-textarea>`;
             break;
        case FormWidgetType.TIME:
            tmpl = `<div wmTime ${attrs.get('required')==='true' ? 'required=true' : ''} dataentrymode="${attrs.get('dataentrymode')}" ${innerTmpl}></div>`;
            break;
        case FormWidgetType.TIMESTAMP:
            tmpl = `<div wmDateTime ${attrs.get('required')==='true' ? 'required=true' : ''} dataentrymode="${attrs.get('dataentrymode')}" ${innerTmpl} role="input"></div>`;
            break;
        case FormWidgetType.UPLOAD:
            const counter = options.counter;
            const pCounter = options.pCounter;
            const uploadProps = options.uploadProps;
            const eventTmpl = getUploadEventTmpl(attrs, counter, uploadProps && uploadProps.name);
            if (uploadProps) {
                tmpl = `<form name="${uploadProps.formName}" ${innerTmpl}>
                            <input focus-target class="file-upload" type="file" name="${uploadProps.name}" ${eventTmpl}/>
                        </form>`;
            } else {
                tmpl = `<a class="form-control-static" href="{{${counter}.href}}" target="_blank" *ngIf="${counter}.filetype === 'image' && ${counter}.href">
                        <img style="height:2em" class="wi wi-file" [src]="${counter}.href"/></a>
                        <a class="form-control-static" target="_blank" href="{{${counter}.href}}" *ngIf="${counter}.filetype !== 'image' && ${counter}.href">
                        <i class="wi wi-file"></i></a>
                        <input ${innerTmpl} class="app-blob-upload" [ngClass]="{'file-readonly': ${counter}.readonly}" ${eventTmpl}
                        [required]="${counter}.required" type="file" name="${attrs.get('key') || attrs.get('name')}_formWidget" [readonly]="${counter}.readonly"
                        [class.hidden]="!${pCounter}.isUpdateMode" [accept]="${counter}.permitted">`;
            }
            break;
        default:
            tmpl = `<wm-input ${innerTmpl} ${attrs.get('required')==='true' ? 'required=true' : ''} aria-describedby="Enter text" type="text" ${updateOnTmpl}></wm-input>`;
            break;
    }
    return tmpl;
};

export const getRequiredFormWidget = (widgetType): string => {
    switch (widgetType) {
        case FormWidgetType.AUTOCOMPLETE:
        case FormWidgetType.TYPEAHEAD:
            return 'wm-search';
        case FormWidgetType.CHIPS:
            return 'wm-chips';
        case FormWidgetType.COLORPICKER:
            return 'wm-colorpicker';
        case FormWidgetType.CURRENCY:
            return 'wm-currency';
        case FormWidgetType.DATE:
            return 'wm-date';
        case FormWidgetType.DATETIME:
            return 'wm-datetime';
        case FormWidgetType.TIME:
        case FormWidgetType.TIMESTAMP:
            return 'wm-time';
        case FormWidgetType.RATING:
            return 'wm-rating';
        case FormWidgetType.RICHTEXT:
            return 'wm-richtexteditor';
        case FormWidgetType.SLIDER:
            return 'wm-slider';
        default:
            return 'wm-text';
    }
};

// This mehtod is used to add datasetboundexpr attribute for node
const addDatasetBoundExprAttribute = (childNode, attr, attrValue) => {
    attrValue = attrValue.replace('bind:', '');
    const datasetBoundAttribute = childNode.attrs.find( a => a.name === 'datasetboundexpr');
    if (attr.name === 'dataset' && !datasetBoundAttribute) {
        childNode.attrs.push(new Attribute('datasetboundexpr', attrValue, attr.sourceSpan, attr.valueSpan));
    }
};


/**
 * exp: User built bind expression
 *  To check the custom pipe expressions.
 *  If user use the custom pipe expression it will check in the exp. that "custom" string exist or not with (:) syntax.
 *  Eg: custom:
 *      custom    :
 */
export const checkIsCustomPipeExpression = function(exp){
    let customRegEx = /(custom(\s*:))/g;
    let matches = exp.match(customRegEx);
    return matches && matches.length;
}


// The bound value is replaced with {{item.fieldname}} here. This is needed by the liveList when compiling inner elements
export const updateTemplateAttrs = (rootNode: Element | Array<Element>, parentDataSet: string, widgetName: string, instance: string = '', referenceName: string = 'item') => {

    const sanitizedParentDataset = parentDataSet.replace(/([^a-zA-Z0-9.])/g, '\\$1');
    const regex = new RegExp('(' + sanitizedParentDataset + ')(\\[0\\])?(.data\\[\\$i\\])?(.content\\[\\$i\\])?(\\[\\$i\\])?', 'g');
    let currentItemRegEx;
    let currentItemWidgetsRegEx;
    let formWidgetsRegex;
    let nodes: Array<Element>;
    const widgetList = {
        'wm-list': ['itemclass', 'disableitem', 'dataset']
    };

    if (widgetName) {
        currentItemRegEx = new RegExp(`(Widgets.${widgetName}.currentItem)\\b`, 'g');
        currentItemWidgetsRegEx = new RegExp(`(Widgets.${widgetName}.currentItemWidgets)\\b`, 'g');
        formWidgetsRegex = new RegExp(`(Widgets.(.*).(formWidgets|filterWidgets))\\b`, 'g');
    }

    if (!_.isArray(rootNode)) {
        // [WMS-16712],[WMS-16769],[WMS-16805] The markup of root node(table, list, carousel) need to be updated only for the widgets mentioned in widgetList map.
        nodes = widgetList[(rootNode as any).name] ? [rootNode as Element] : ((rootNode as any).children || []) as Array<Element>;
    } else {
        nodes = rootNode as Array<Element>;
    }

    nodes.forEach((childNode: Element) => {
        if (childNode.name) {
            const nodeName = childNode.name;
            const parentDataSetLengthRegex =  new RegExp('bind:\\s*\\(*' + parentDataSet + '\\)*\\.length\\)*');
            childNode.attrs.forEach((attr) => {
                // trim the extra spaces in bindings
                let value = attr.value && attr.value.trim();
                if (_.startsWith(value, 'bind:')) {
                    // The markup of root node(table, list, carousel) attributes conatains same dataset variable binding then those attributes need to be updated only for specific properties mentioned in widgetList map.
                    if (!widgetList[nodeName] || (widgetList[nodeName] && widgetList[nodeName].indexOf(attr.name) > -1)) {
                        // if the attribute value is "bind:xxxxx.xxxx", either the dataSet/scopeDataSet has to contain "xxxx.xxxx"
                        // [WMS-17908]: if child widget contains bind expression as parendataset.length > 0 then dont replace it with item
                        if (_.includes(value, parentDataSet) && value !== 'bind:' + parentDataSet && !parentDataSetLengthRegex.test(value)) {
                            value = value.replace('bind:', '');
                            addDatasetBoundExprAttribute(childNode, attr, value);
                            value = value.replace(regex, referenceName);
                            value = 'bind:' + value;
                            // Check is this custom bind expression and currentWidgetItem regex
                            if(checkIsCustomPipeExpression(value) && currentItemRegEx){
                                // Adding the currentItem as last argument for the expression.
                                // For the custom pipes(expresion), it will send the currentItem as context.
                                value +=  ':'+ currentItemRegEx.exec(currentItemRegEx.source)[0];
                            }
                        }
                    }
                    // Replace item if widget property is bound to livelist currentItem
                    if (currentItemRegEx && currentItemRegEx.test(value)) {
                        // Change value from 'bind:Widgets.formName.formWidgets.listName.currentItem' to 'bind:Widgets.listName.currentItem'
                        if (value.includes('.formWidgets') || value.includes('.filterWidgets')) {
                            value = value.replace(formWidgetsRegex, 'Widgets');
                        }
                        addDatasetBoundExprAttribute(childNode, attr, value);
                        value = value.replace(currentItemRegEx, referenceName);
                    }
                    if (currentItemWidgetsRegEx && currentItemWidgetsRegEx.test(value)) {
                        value = value.replace(currentItemWidgetsRegEx, `${instance}currentItemWidgets`);
                    }

                    attr.value = value;
                }
            });
            updateTemplateAttrs(childNode.children as Array<Element>, parentDataSet, widgetName, instance, referenceName);
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
        ['hyperlink.bind', 'hyperlink.bind'],
        ['target', 'target'],
        ['conditionalclass.bind', 'conditionalclass.bind'],
        ['conditionalstyle.bind', 'conditionalstyle.bind']
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
