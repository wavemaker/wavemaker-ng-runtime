import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'main';

register('wm-content', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmContent data-role="page-content" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};