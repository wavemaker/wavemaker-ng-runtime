import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'ul';

register('wm-radioset', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRadioset role="input" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};