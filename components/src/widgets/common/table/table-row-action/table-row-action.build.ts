import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

const rowActionAttrs = new Map(
    [
        ['display-name', 'caption'],
        ['display-name.bind', 'caption.bind'],
        ['title', 'hint'],
        ['title.bind', 'hint.bind'],
        ['show', 'show'],
        ['show.bind', 'show.bind'],
        ['disabled', 'disabled'],
        ['disabled.bind', 'disabled.bind']
    ]
);

const getRowActionAttrs = attrs => {
    let tmpl = '';
    attrs.forEach((val, key) => {
       const newAttr = rowActionAttrs.get(key);
       if (newAttr) {
           tmpl += `${newAttr}="${val}" `;
       }
    });
    return tmpl;
};

const getSaveCancelTemplate = () => {
    return `<button type="button" class="save row-action-button btn app-button btn-transparent save-edit-row-button hidden" title="Save">
                <i class="wi wi-done"></i>
            </button>
            <button type="button" class="cancel row-action-button btn app-button btn-transparent cancel-edit-row-button hidden" title="Cancel">
                <i class="wi wi-cancel"></i>
            </button>`;
};

// get the inline widget template
const getRowActionTmpl = (attrs) => {
    const action = attrs.get('action');
    const saveCancelTmpl = action && action.includes('editRow(') ? getSaveCancelTemplate() : '';
    const btnClass = action.includes('editRow(') ? 'edit edit-row-button' :
                        (action.includes('deleteRow(') ? 'delete delete-row-button' : '');
    return `<ng-template #rowActionTmpl let-row="row" let-$rowData="$rowData">
               <button wmButton data-action-key="${attrs.get('key')}"
                    ${getRowActionAttrs(attrs)}
                    class="row-action row-action-button app-button btn ${attrs.get('class')} ${btnClass}"
                    iconclass="${attrs.get('iconclass')}"
                    click.event="${action}"
                    tabindex="${attrs.get('tabindex')}"
                    type="button"></button>
                ${saveCancelTmpl}
            </ng-template>`;
};

register('wm-table-row-action', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTableRowAction ${getAttrMarkup(attrs)}>
                        ${getRowActionTmpl(attrs)}`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
