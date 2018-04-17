import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'textarea';

register('wm-textarea', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTextarea ${getAttrMarkup(attrs)} role="input">`,
        post: () => `</${tagName}>`
    };
});

export default () => {};