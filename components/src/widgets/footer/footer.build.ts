import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'footer';

register('wm-footer', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmFooter partialContainer data-role="page-footer" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};