import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-form-action', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmFormAction ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
