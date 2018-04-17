import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-container', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmContainer partialContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};