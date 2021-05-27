import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-nav', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNav data-element-type="wmNav" data-role="page-header" role="list" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
