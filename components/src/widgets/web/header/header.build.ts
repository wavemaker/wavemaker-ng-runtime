import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'header';

register('wm-header', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmHeader partialContainer data-role="page-header" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};