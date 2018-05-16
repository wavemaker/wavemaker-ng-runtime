import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-alertdialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAlertDialog role="alert" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
