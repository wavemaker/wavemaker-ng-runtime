import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'footer';

register('wm-footer', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmFooter partialContainer data-role="page-footer" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};