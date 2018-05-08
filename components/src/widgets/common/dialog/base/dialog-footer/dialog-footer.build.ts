import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

// if the dialog footer is part of design dialog, close div tag opened at design-dialog build task
// todo: vinay find a better way

register('wm-dialogactions', (): IBuildTaskDef => {
    return {
        requires: 'wm-dialog',
        pre: (attrs, shared, requires) => `${requires ? '</div>' : ''}<${tagName} wmDialogFooter data-identfier="actions" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
