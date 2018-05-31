import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'wm-select';

register('wm-select', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} ${getAttrMarkup(attrs)} ngModel>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
