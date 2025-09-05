import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { getRowActionAttrs } from '@wm/core';

const tagName = 'div';

const getRowExpansionActionTmpl = (attrs) => {
    const tag = attrs.get('widget-type') === 'anchor' ? 'a' : 'button';
    const directive = attrs.get('widget-type') === 'anchor' ? 'wmAnchor' : 'wmButton';
    const title = attrs.get('expandtitle') || attrs.get('display-name') ||'Collapse/Expand';
    return `<ng-template #rowExpansionActionTmpl let-row="row">
               <${tag} ${directive}
                    title="${title}"
                    ${getRowActionAttrs(attrs)}
                    class="${attrs.get('class')} row-expansion-button"
                    iconclass="${attrs.get('collapseicon')}"
                    type="button" aria-label="${title}"></${tag}>
            </ng-template>`;
};

register('wm-table-row', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            return `<${tagName} wmTableRow ${getAttrMarkup(attrs)}>
                    ${getRowExpansionActionTmpl(attrs)}
                    <ng-template #rowExpansionTmpl let-row="row" let-rowDef="rowDef" let-containerLoad="containerLoad">
                        <div wmContainer partialContainer content.bind="rowDef.content" load.event="containerLoad(widget)"
                            [ngStyle]="{'height': rowDef.height, 'overflow-y': 'auto'}">
                        @for (param of rowDef.partialParams | keyvalue; track param) {
                         <div wmParam hidden
                            [name]="param.key" [value]="param.value"></div>
                        }`;
        },
        post: () => `</div></ng-template></${tagName}>`
    };
});

export default () => {};
