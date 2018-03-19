import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'header';

register('wm-header', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmHeader partialContainer data-role="page-header" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};