import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'wm-textarea';

register('wm-textarea', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} ${getAttrMarkup(attrs)} ngModel>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};