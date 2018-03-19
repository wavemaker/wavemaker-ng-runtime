import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'ul';

register('wm-nav', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmNav data-element-type="wmNav" data-role="page-header" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};