import { Element } from '@angular/compiler';
import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { DataType, FormWidgetType, getFormWidgetTemplate, IDGenerator } from '@wm/core';
import { getDataTableFilterWidget, getEditModeWidget, EDIT_MODE } from '../../../../utils/live-utils';

const tagName = 'div';
const idGen = new IDGenerator('data_table_form_');

// get the filter template (widget and filter menu) to be displayed in filter row
const getFilterTemplate = (attrs, pCounter)  => {
    const widget = attrs.get('filterwidget') || getDataTableFilterWidget(attrs.get('type') || DataType.STRING);
    const fieldName = attrs.get('binding');
    const type = attrs.get('type') || 'string';
    const innerTmpl = `#filterWidget formControlName="${fieldName + '_filter'}" change.event="changeFn('${fieldName}')"
                        disabled.bind="isDisabled('${fieldName}')"`;
    const widgetTmpl = `${getFormWidgetTemplate(widget, innerTmpl, attrs)}`;

    return `<ng-template #filterTmpl let-changeFn="changeFn" let-isDisabled="isDisabled">
    <span class="input-group ${widget}" data-col-identifier="${fieldName}">
        ${widgetTmpl}
        <span class="input-group-addon filter-clear-icon" *ngIf="${pCounter}.showClearIcon('${fieldName}')">
            <button class="btn-transparent btn app-button" type="button" (click)="${pCounter}.clearRowFilter('${fieldName}')">
                <i class="app-icon wi wi-clear"></i>
            </button>
         </span>
        <span class="input-group-addon" dropdown container="body">
            <button class="btn-transparent btn app-button" type="button" dropdownToggle><i class="app-icon wi wi-filter-list"></i></button>
            <ul class="matchmode-dropdown dropdown-menu" *dropdownMenu>
                   <li *ngFor="let matchMode of ${pCounter}.matchModeTypesMap['${type}']"
                        [ngClass]="{active: matchMode === (${pCounter}.rowFilter['${fieldName}'].matchMode || ${pCounter}.matchModeTypesMap['${type}'][0])}">
                        <a href="javascript:void(0);" (click)="${pCounter}.onFilterConditionSelect('${fieldName}', matchMode)">
                            {{${pCounter}.matchModeMsgs[matchMode]}}
                        </a>
                    </li>
             </ul>
        </span>
    </span></ng-template>`;
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

// get the inline widget template
const getInlineEditWidgetTmpl = (attrs, isNewRow?) => {
    const options: any = {};
    const fieldName = attrs.get('binding');
    const widget = attrs.get('edit-widget-type') || getEditModeWidget({
        'type': attrs.get('type'),
        'related-entity-name': attrs.get('related-entity-name'),
        'primary-key': attrs.get('primary-key')
    });
    let widgetRef;
    let formControl;
    if (widget === FormWidgetType.UPLOAD) {
        options.uploadProps = {
            formName: idGen.nextUid(),
            name: fieldName
        };
        widgetRef = '';
        formControl = '';
    } else {
        widgetRef = isNewRow ? '#inlineWidgetNew' : '#inlineWidget';
        formControl = isNewRow ? `formControlName="${fieldName}_new"` : `formControlName="${fieldName}"`;
    }
    const tmplRef = isNewRow ? '#inlineWidgetTmplNew' : '#inlineWidgetTmpl';
    const eventsTmpl = getEventsTmpl(attrs);
    const innerTmpl = `${widgetRef} data-col-identifier="${fieldName}" data-field-name="${fieldName}" ${formControl} ${eventsTmpl}`;
    const widgetTmpl = getFormWidgetTemplate(widget, innerTmpl, attrs, options);

    return `<ng-template ${tmplRef} let-row="row" let-rowData="rowData">
                 ${widgetTmpl}
            </ng-template>`;
};

const getFormatExpression = (attrs) => {
    const columnValue = `row.getProperty('${attrs.get('binding')}')`;
    const formatPattern = attrs.get('formatpattern');
    let colExpression = '';
    switch (formatPattern) {
        case 'toDate':
            const datePattern = attrs.get('datepattern');
            if (datePattern) {
                colExpression = `{{${columnValue} | toDate: '${datePattern}'}}`;
            }
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
            shared.set('customExpression', node.children.length > 0);
        },
        pre: (attrs, shared, parentTable) => {
            const pCounter = parentTable.get('table_reference');
            const rowFilterTmpl = (parentTable.get('filtermode') === 'multicolumn' && attrs.get('searchable') !== 'false') ? getFilterTemplate(attrs, pCounter) : '';
            const editMode = parentTable.get('editmode');
            const isInlineEdit = (editMode !== EDIT_MODE.DIALOG && editMode !== EDIT_MODE.FORM && attrs.get('readonly') !== 'true');
            const inlineEditTmpl = isInlineEdit ? getInlineEditWidgetTmpl(attrs) : '';
            const inlineNewEditTmpl = isInlineEdit && editMode === EDIT_MODE.QUICK_EDIT && parentTable.get('shownewrow') !== 'false' ? getInlineEditWidgetTmpl(attrs, true) : '';
            const formatPattern = attrs.get('formatpattern');
            const customExpr = `<ng-template #customExprTmpl let-row="row" let-columnValue="columnValue" let-colDef="colDef" let-selectedItemData="selectedItemData">`;
            let customExprTmpl = '';
            let formatExprTmpl = '';

            if (shared.get('customExpression')) {
                attrs.set('customExpression', 'true');
                customExprTmpl = `${customExpr}<div data-col-identifier="${attrs.get('binding')}">`;
            } else if (formatPattern) {
                if (formatPattern !== 'None') {
                    formatExprTmpl = getFormatExpression(attrs);
                    if (formatExprTmpl) {
                        shared.set('customExpression', true);
                        attrs.set('customExpression', 'true');
                        customExprTmpl = `${customExpr}<div data-col-identifier="${attrs.get('binding')}" title="${formatExprTmpl}">${formatExprTmpl}`;
                    }
                }
            }

            return `<${tagName} wmTableColumn ${getAttrMarkup(attrs)} [formGroup]="${pCounter}.ngform">
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
        }
    };
});

export default () => {};
