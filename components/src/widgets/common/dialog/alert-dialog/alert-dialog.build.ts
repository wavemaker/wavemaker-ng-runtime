import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-alertdialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAlertDialog role="alertdialog" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
