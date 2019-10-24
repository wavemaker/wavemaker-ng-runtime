import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-nav', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNav data-element-type="wmNav" data-role="page-header" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
