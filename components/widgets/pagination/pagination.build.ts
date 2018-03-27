import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'nav';

register('wm-pagination', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPagination data-identifier="pagination" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
