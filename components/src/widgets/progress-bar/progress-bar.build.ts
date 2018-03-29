import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-progressbar', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmProgressBar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
