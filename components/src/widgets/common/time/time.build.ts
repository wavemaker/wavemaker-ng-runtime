import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-time', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTime ${getAttrMarkup(attrs)} role="input" ngModel>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
