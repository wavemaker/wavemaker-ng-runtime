import { Element } from '@angular/compiler';
import { getAttrMarkup, IBuildTaskDef, processNode, register } from '@wm/transpiler';
import { getRowActionAttrs } from '@wm/core';

const tagName = 'div';

const getRowExpansionActionTmpl = (attrs) => {
    const tag = attrs.get('widget-type') === 'anchor' ? 'a' : 'button';
    const directive = attrs.get('widget-type') === 'anchor' ? 'wmAnchor' : 'wmButton';
    return `<ng-template #rowExpansionActionTmpl let-row="row">
               <${tag} ${directive}
                    ${getRowActionAttrs(attrs)}
                    class="${attrs.get('class')} row-expansion-button"
                    iconclass="${attrs.get('collapseicon')}"
                    type="button"></${tag}>
            </ng-template>`;
};

register('wm-table-row', (): IBuildTaskDef => {
    return {
        template: (node: Element, shared) => {
            let markup = '';
            node.children.forEach(child => markup += processNode(child));
            node.children = [];
            shared.set('paramExpression', encodeURIComponent(markup));
        },
        pre: (attrs, shared) => {
            attrs.set('paramExpression', shared.get('paramExpression'));
            return `<${tagName} wmTableRow ${getAttrMarkup(attrs)}>
                    ${getRowExpansionActionTmpl(attrs)}`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
