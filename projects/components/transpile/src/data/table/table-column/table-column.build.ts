import { Attribute, Element, Text } from '@angular/compiler';

import { DataType, FormWidgetType, getFormWidgetTemplate, getRequiredFormWidget, IDGenerator, isDateTimeType } from '@wm/core';
import {getAttrMarkup, getDataSource, IBuildTaskDef, ImportDef, register} from '@wm/transpiler';

import { EDIT_MODE, getDataTableFilterWidget, getEditModeWidget } from '../../../utils/utils';

const tagName = 'div';
const idGen = new IDGenerator('data_table_form_');
const formWidgets = new Set([
    'wm-text',
    'wm-textarea',
    'wm-checkbox',
    'wm-slider',
    'wm-currency',
    'wm-switch',
    'wm-select',
    'wm-checkboxset',
    'wm-radioset',
    'wm-date',
    'wm-time',
    'wm-timestamp',
    'wm-rating',
    'wm-datetime',
    'wm-search',
    'wm-chips',
    'wm-colorpicker'
]);

// Add ngModelOptions standalone true as inner custom form widgets will be not part of table ngform
const addNgModelStandalone = (children = []) => {
    children.forEach(childNode => {
        if (formWidgets.has(childNode.name)) {
            childNode.attrs.push(new Attribute('[ngModelOptions]', '{standalone: true}', <any>1, <any>1));
        }
        addNgModelStandalone(childNode.children);
    });
};

// get the filter template (widget and filter menu) to be displayed in filter row
const getFilterTemplate = (attrs, pCounter)  => {
    const widget = attrs.get('filterwidget') || getDataTableFilterWidget(attrs.get('type') || DataType.STRING);
    const fieldName = attrs.get('binding');
    const type = attrs.get('type') || 'string';
    let datasourceBinding, submitEventBinding;
    const datasetAttr = attrs.get('filterdataset.bind');
    // when multicolumn is selected and filterwidget as autocomplete is assigned to dataset.
    if (attrs.get('filterwidget') === 'autocomplete') {
        if (datasetAttr) {
            const binddatasource = getDataSource(datasetAttr);
            datasourceBinding = `dataset.bind="${datasetAttr}" datasource.bind="${binddatasource}"`;
        }
        submitEventBinding = `submit.event="changeFn('${fieldName}')"`;
    }
    const innerTmpl = `#filterWidget formControlName="${fieldName + '_filter'}" ${datasourceBinding} ${submitEventBinding} change.event="changeFn('${fieldName}')"
                        disabled.bind="isDisabled('${fieldName}')"`;
    const options = {inputType: 'filterinputtype'} ;
    const widgetTmpl = `${getFormWidgetTemplate(widget, innerTmpl, attrs, options)}`;

    return `<ng-template #filterTmpl let-changeFn="changeFn" let-isDisabled="isDisabled">
    <div class="input-group ${widget}" data-col-identifier="${fieldName}">
        ${widgetTmpl}
        <span class="input-group-addon filter-clear-icon" *ngIf="${pCounter}.showClearIcon('${fieldName}')">
            <button class="btn-transparent btn app-button" aria-label="Clear button" type="button" (click)="${pCounter}.clearRowFilter('${fieldName}')">
                <i class="app-icon wi wi-clear" aria-hidden="true"></i>
            </button>
         </span>
        <span class="input-group-addon" dropdown container="body">
            <button class="btn-transparent btn app-button" type="button" dropdownToggle><i class="app-icon wi wi-filter-list"></i></button>
            <ul class="matchmode-dropdown dropdown-menu" *dropdownMenu>
                   <li *ngFor="let matchMode of ${pCounter}.matchModeTypesMap['${type}']"
                        [ngClass]="{active: matchMode === (${pCounter}.rowFilter['${fieldName}'].matchMode || ${pCounter}.matchModeTypesMap['${type}'][0])}">
                        <a href="javascript:void(0);" (click)="${pCounter}.onFilterConditionSelect('${fieldName}', matchMode)" [innerText]="${pCounter}.matchModeMsgs[matchMode]"></a>
                    </li>
             </ul>
        </span>
    </div></ng-template>`;
};

const getEventsTmpl = attrs => {
    let tmpl = '';
    attrs.forEach((val, key) => {
        if (key.endsWith('.event')) {
            tmpl += `${key}="${val}" `;
        }
    });
    return tmpl;
};

// Generate inline edit properties template. Properties requiring row instance are generated here.
const getInlineEditRowPropsTmpl = attrs => {
    const propAttrs = new Map();
    const props = ['disabled', 'disabled.bind'];
    props.forEach(prop => {
        if (attrs.get(prop)) {
            propAttrs.set(prop, attrs.get(prop));
            attrs.delete(prop);
        }
    });
    return getAttrMarkup(propAttrs);
};

// get the inline widget template
const getInlineEditWidgetTmpl = (attrs, isNewRow?, pCounter?) => {
    const options: any = {};
    const fieldName = attrs.get('binding');
    const widget = attrs.get('edit-widget-type') || getEditModeWidget({
        'type': attrs.get('type'),
        'related-entity-name': attrs.get('related-entity-name'),
        'primary-key': attrs.get('primary-key')
    });
    let widgetRef = '';
    let formControl = '';
    let wmFormWidget = '';
    if (widget === FormWidgetType.UPLOAD) {
        options.uploadProps = {
            formName: idGen.nextUid(),
            name: fieldName
        };
        options.counter = pCounter;
    } else {
        widgetRef = isNewRow ? '#inlineWidgetNew' : '#inlineWidget';
        formControl = isNewRow ? `formControlName="${fieldName}_new"` : `formControlName="${fieldName}"`;
        wmFormWidget = 'wmFormWidget';
    }
    options.inputType = 'editinputtype';
    const tmplRef = isNewRow ? '#inlineWidgetTmplNew' : '#inlineWidgetTmpl';
    const eventsTmpl = widget === FormWidgetType.UPLOAD ? '' : getEventsTmpl(attrs);
    const rowPropsTl = getInlineEditRowPropsTmpl(attrs);
    const innerTmpl = `${widgetRef} ${wmFormWidget} key="${fieldName}" data-field-name="${fieldName}" ${formControl} ${eventsTmpl} ${rowPropsTl}`;
    const widgetTmpl = getFormWidgetTemplate(widget, innerTmpl, attrs, options);

    return `<ng-template ${tmplRef} let-row="row" let-getControl="getControl" let-getValidationMessage="getValidationMessage">
                <div data-col-identifier="${fieldName}" >
                     ${widgetTmpl}
                     <span placement="top" container="body" tooltip="{{getValidationMessage()}}" class="text-danger wi wi-error"
                        *ngIf="getValidationMessage() && getControl() && getControl().invalid && getControl().touched">
                     </span>
                     <span class="sr-only" *ngIf="getValidationMessage()">{{getValidationMessage()}}</span>
                 </div>
            </ng-template>`;
};

const getFormatExpression = (attrs) => {
    const columnValue = `row.getProperty('${attrs.get('binding')}')`;
    let formatPattern = attrs.get('formatpattern');
    let colExpression = '';
    // For date time data types, if format pattern is not applied, Apply default toDate format
    if (isDateTimeType(attrs.get('type')) && (!formatPattern || formatPattern === 'None')) {
        attrs.set('formatpattern', 'toDate');
        attrs.delete('datepattern');
        formatPattern = 'toDate';
    }
    switch (formatPattern) {
        case 'toDate':
            colExpression = `{{${columnValue} | toDate: colDef.datepattern}}`;
            break;
        case 'toCurrency':
            if (attrs.get('currencypattern')) {
                colExpression = `{{${columnValue} | toCurrency: '${attrs.get('currencypattern')}`;

                if (attrs.get('fractionsize')) {
                    colExpression += `': ${attrs.get('fractionsize')}}}`;
                } else {
                    colExpression += `'}}`;
                }
            }
            break;
        case 'numberToString':
            if (attrs.get('fractionsize')) {
                colExpression = `{{${columnValue} | numberToString: '${attrs.get('fractionsize')}'}}`;
            }
            break;
        case 'stringToNumber':
            colExpression = `{{${columnValue} | stringToNumber}}`;
            break;
        case 'timeFromNow':
            colExpression = `{{${columnValue} | timeFromNow}}`;
            break;
        case 'prefix':
            if (attrs.get('prefix')) {
                colExpression = `{{${columnValue} | prefix: '${attrs.get('prefix')}'}}`;
            }
            break;
        case 'suffix':
            if (attrs.get('suffix')) {
                colExpression = `{{${columnValue} | suffix: '${attrs.get('suffix')}'}}`;
            }
            break;
    }
    return colExpression;
};

register('wm-table-column', (): IBuildTaskDef => {
    return {
        requires: ['wm-table'],
        template: (node: Element, shared) => {
            if (node.children.length) {
                // If node has children, but an empty text node dont generate custom expression
                if (node.children.length === 1 && node.children[0] instanceof Text && (node.children[0] as Text).value.trim().length === 0) {
                    return;
                }
                shared.set('customExpression', true);
                addNgModelStandalone(node.children);
            }
        },
        pre: (attrs, shared, parentTable) => {
            let rowFilterTmpl = '';
            let inlineEditTmpl = '';
            let inlineNewEditTmpl = '';
            let parentForm = '';
            if (parentTable) {
                const pCounter = parentTable.get('table_reference');
                rowFilterTmpl = (parentTable.get('filtermode') === 'multicolumn' && attrs.get('searchable') !== 'false') ? getFilterTemplate(attrs, pCounter) : '';
                const editMode = parentTable.get('editmode');
                const isInlineEdit = (editMode !== EDIT_MODE.DIALOG && editMode !== EDIT_MODE.FORM && attrs.get('readonly') !== 'true');
                inlineEditTmpl = isInlineEdit ? getInlineEditWidgetTmpl(attrs, false, pCounter) : '';
                inlineNewEditTmpl = isInlineEdit && editMode === EDIT_MODE.QUICK_EDIT && parentTable.get('shownewrow') !== 'false' ? getInlineEditWidgetTmpl(attrs, true) : '';
                parentForm = ` [formGroup]="${pCounter}.ngform" `;
            }
            const formatPattern = attrs.get('formatpattern');
            const customExpr = `<ng-template #customExprTmpl let-row="row" let-colDef="colDef" let-editRow="editRow" let-deleteRow="deleteRow" let-addNewRow="addNewRow">`;
            let customExprTmpl = '';
            let formatExprTmpl = '';

            if (shared.get('customExpression')) {
                attrs.set('customExpression', 'true');
                customExprTmpl = `${customExpr}<div data-col-identifier="${attrs.get('binding')}">`;
            } else if ((formatPattern && formatPattern !== 'None') || isDateTimeType(attrs.get('type'))) {
                formatExprTmpl = getFormatExpression(attrs);
                if (formatExprTmpl) {
                    shared.set('customExpression', true);
                    attrs.set('customExpression', 'true');
                    customExprTmpl = `${customExpr}<div data-col-identifier="${attrs.get('binding')}" title="${formatExprTmpl}">${formatExprTmpl}`;
                }
            }

            return `<${tagName} wmTableColumn ${getAttrMarkup(attrs)} ${parentForm}>
                    ${rowFilterTmpl}
                    ${inlineEditTmpl}
                    ${inlineNewEditTmpl}
                    ${customExprTmpl}`;
        },
        post: (attrs, shared) => {
            let customExprTmpl = '';

            if (shared.get('customExpression')) {
                customExprTmpl = `</div></ng-template>`;
            }
            return `${customExprTmpl}</${tagName}>`;
        },
        imports: (attrs: Map<String, String>): string[] => {
            const widgetType = attrs.get('filterwidget') || getDataTableFilterWidget(attrs.get('type') || DataType.STRING);
            const requiredWidget = getRequiredFormWidget(widgetType);
            return [requiredWidget, 'wm-table'];
        }
    };
});

export default () => {};
