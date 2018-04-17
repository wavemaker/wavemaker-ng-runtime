import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-progressbar', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmProgressBar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
