import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'p';

register('wm-message', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMessage role="alert" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};