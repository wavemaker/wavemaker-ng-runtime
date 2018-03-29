import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'p';

register('wm-message', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMessage ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};