import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'main';

register('wm-content', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmContent data-role="page-content" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};