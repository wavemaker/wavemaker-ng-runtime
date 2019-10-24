import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-dialogactions', (): IBuildTaskDef => {
    return {
        pre: attrs => `<ng-template #dialogFooter><${tagName} wmDialogFooter data-identfier="actions" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}></ng-template>`
    };
});

export default () => {};
