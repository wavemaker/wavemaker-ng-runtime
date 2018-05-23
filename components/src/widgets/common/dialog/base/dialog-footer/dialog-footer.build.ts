import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-dialogactions', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDialogFooter data-identfier="actions" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
