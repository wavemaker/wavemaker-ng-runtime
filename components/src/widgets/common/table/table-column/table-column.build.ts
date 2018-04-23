import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-table-column', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTableColumn ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
