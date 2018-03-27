import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-table', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTable data-identifier="table" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
