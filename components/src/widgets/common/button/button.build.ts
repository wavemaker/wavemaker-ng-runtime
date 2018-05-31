import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'button';

register('wm-button', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmButton ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};