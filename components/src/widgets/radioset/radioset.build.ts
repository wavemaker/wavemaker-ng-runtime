import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-radioset', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRadioset role="input" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};