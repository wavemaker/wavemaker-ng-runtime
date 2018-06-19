import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'main';

register('wm-content', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmContent data-role="page-content" role="main" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};