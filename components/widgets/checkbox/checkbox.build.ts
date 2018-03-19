import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-checkbox', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmCheckbox role="input" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};