import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-iframedialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmIframeDialog wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
