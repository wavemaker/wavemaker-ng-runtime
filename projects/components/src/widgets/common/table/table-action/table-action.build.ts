import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-table-action', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} name="${attrs.get('name') || attrs.get('key')}" wmTableAction ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
