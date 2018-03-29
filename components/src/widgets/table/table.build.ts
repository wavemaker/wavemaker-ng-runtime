import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-table', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTable data-identifier="table" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
