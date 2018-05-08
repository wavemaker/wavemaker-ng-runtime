import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-text', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmInput ${getAttrMarkup(attrs)} ngModel>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
