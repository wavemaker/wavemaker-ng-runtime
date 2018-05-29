import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-card-content', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCardContent partialContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};