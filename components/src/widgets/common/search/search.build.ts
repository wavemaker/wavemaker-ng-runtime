import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-search', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSearch ${getAttrMarkup(attrs)} ngModel>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
