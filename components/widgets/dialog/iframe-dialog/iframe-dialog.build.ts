import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-iframedialog', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmIframeDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
