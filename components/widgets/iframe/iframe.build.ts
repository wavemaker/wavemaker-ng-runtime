import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-iframe', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmIframe ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};