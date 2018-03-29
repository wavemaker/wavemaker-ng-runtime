import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'span';

register('wm-icon', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmIcon ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};