import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'span';

register('wm-icon', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmIcon ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};