import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-tabs', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTabs ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
