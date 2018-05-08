import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-checkboxset', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCheckboxset ${getAttrMarkup(attrs)} ngModel>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};