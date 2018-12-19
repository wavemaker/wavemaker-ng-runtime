import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-menu', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMenu dropdown ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
