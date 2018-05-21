import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-table', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTable wmTableFilterSort data-identifier="table" role="table" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
