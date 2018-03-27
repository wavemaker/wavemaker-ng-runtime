import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-page', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPage data-role="pageContainer" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
