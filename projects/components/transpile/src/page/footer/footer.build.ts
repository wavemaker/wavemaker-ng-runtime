import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'footer';

register('wm-footer', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmFooter partialContainer data-role="page-footer" role="contentinfo" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
