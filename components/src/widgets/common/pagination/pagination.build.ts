import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'nav';

register('wm-pagination', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPagination data-identifier="pagination" aria-label="Page navigation" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
