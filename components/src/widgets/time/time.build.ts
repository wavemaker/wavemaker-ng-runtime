import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-time', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTime ${getAttrMarkup(attrs)} role="input">`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
