import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { getRowActionAttrs } from '@wm/core';

const tagName = 'div';

const getSaveCancelTemplate = () => {
    return `<button type="button" aria-label="Save edit icon" class="save row-action-button btn app-button btn-transparent save-edit-row-button hidden" title="Save">
                <i class="wi wi-done" aria-hidden="true"></i>
            </button>
            <button type="button" aria-label="Cancel edit icon" class="cancel row-action-button btn app-button btn-transparent cancel-edit-row-button hidden" title="Cancel">
                <i class="wi wi-cancel" aria-hidden="true"></i>
            </button>`;
};

// get the inline widget template
const getRowActionTmpl = (attrs) => {
    const action =  attrs.get('action');
    const actionTmpl = action ? ` click.event.delayed="${action}" ` : '';
    const saveCancelTmpl = action && action.includes('editRow(') ? getSaveCancelTemplate() : '';
    const btnClass = action ? (action.includes('editRow(') ? 'edit edit-row-button' :
                        (action.includes('deleteRow(') ? 'delete delete-row-button' : '')) : '';
    const tabIndex = attrs.get('tabindex') ? `tabindex="${attrs.get('tabindex')}"` : '';
    const tag = attrs.get('widget-type') === 'anchor' ? 'a' : 'button';
    const directive = attrs.get('widget-type') === 'anchor' ? 'wmAnchor' : 'wmButton';
    return `<ng-template #rowActionTmpl let-row="row">
               <${tag} ${directive} data-action-key="${attrs.get('key')}"
                    ${getRowActionAttrs(attrs)}
                    class="row-action row-action-button ${attrs.get('class')} ${btnClass}"
                    iconclass="${attrs.get('iconclass')}"
                    ${actionTmpl}
                    ${tabIndex}
                    type="button"></${tag}>
                ${saveCancelTmpl}
            </ng-template>`;
};

register('wm-table-row-action', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTableRowAction ${getAttrMarkup(attrs)}>
                        ${getRowActionTmpl(attrs)}`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/data/table',
            name: 'TableModule'
        }]
    };
});

export default () => {};
