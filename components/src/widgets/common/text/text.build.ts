import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'wm-input';

register('wm-text', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} ${getAttrMarkup(attrs)} ngModel>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
