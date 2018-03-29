import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-iframedialog', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmIframeDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
