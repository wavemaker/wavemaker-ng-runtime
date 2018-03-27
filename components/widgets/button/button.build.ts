import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'button';

register('wm-button', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmButton role="input" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};