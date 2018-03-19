import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-colorpicker', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmColorPicker ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};