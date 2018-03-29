import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-radioset', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRadioset role="input" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};