import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-spinner', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmSpinner ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
