import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'main';

register('wm-content', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmContent data-role="page-content" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};