import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'textarea';

register('wm-textarea', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTextarea ${getAttrMarkup(attrs)} role="input">`,
        post: () => `</${tagName}>`
    };
});

export default () => {};