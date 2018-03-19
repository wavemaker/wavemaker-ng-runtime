import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-table', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmTable data-identifier="table" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
