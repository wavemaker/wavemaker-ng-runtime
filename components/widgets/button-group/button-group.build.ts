import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-buttongroup', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmButtonGroup role="input" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};