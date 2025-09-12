import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-iframe', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmIframe ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
