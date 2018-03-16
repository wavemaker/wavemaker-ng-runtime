import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-colorpicker', () => {
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