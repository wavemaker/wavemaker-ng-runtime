import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-chips', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmChips role="button" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
