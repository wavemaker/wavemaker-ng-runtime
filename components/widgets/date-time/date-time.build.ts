import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-datetime', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDateTime ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};