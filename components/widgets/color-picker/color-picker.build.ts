import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-colorpicker', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmColorPicker ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};