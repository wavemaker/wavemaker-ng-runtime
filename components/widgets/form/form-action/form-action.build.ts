import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-form-action', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmFormAction ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
