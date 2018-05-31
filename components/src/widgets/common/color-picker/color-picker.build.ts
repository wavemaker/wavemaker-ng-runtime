import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-colorpicker', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmColorPicker ${getAttrMarkup(attrs)} role="input" ngModel>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};