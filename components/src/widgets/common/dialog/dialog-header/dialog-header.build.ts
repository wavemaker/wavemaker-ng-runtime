import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-dialogheader', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDialogHeader data-identifier="dialog-header" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
