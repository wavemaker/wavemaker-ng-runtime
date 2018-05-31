import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-page', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPage data-role="pageContainer" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
