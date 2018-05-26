import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { DataType, getFormWidgetTemplate } from '@wm/core';
import { getDataTableFilterWidget } from '../../../../utils/live-utils';

const tagName = 'div';

// get the filter template (widget and filter menu) to be displayed in filter row
const getFilterTemplate = (attrs, pCounter)  => {
    const widget = attrs.get('filterwidget') || getDataTableFilterWidget(attrs.get('type') || DataType.STRING);
    const fieldName = attrs.get('binding');
    const type = attrs.get('type') || 'string';
    const innerTmpl = `#filterWidget [(ngModel)]="${pCounter}.rowFilter['${fieldName}'].value" change.event="changeFn('${fieldName}')"
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

register('wm-table-column', (): IBuildTaskDef => {
    return {
        requires: ['wm-table'],
        pre: (attrs, shared, parentTable) => {
            const pCounter = parentTable.get('table_reference');
            const rowFilterTmpl = parentTable.get('filtermode') === 'multicolumn' ? getFilterTemplate(attrs, pCounter) : '';
            return `<${tagName} wmTableColumn ${getAttrMarkup(attrs)}> ${rowFilterTmpl}`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
