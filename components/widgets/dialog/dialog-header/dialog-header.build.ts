import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-dialogheader', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmDialogHeader data-identifier="dialog-header" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
