import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'ul';

register('wm-radioset', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmRadioset role="input" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};