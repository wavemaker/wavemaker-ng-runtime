import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-buttongroup', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmButtonGroup role="input" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};