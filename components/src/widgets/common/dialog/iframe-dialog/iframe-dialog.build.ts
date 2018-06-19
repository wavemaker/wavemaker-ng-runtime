import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-iframedialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmIframeDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
