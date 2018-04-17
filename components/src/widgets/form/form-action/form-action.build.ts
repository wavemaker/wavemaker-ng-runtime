import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-form-action', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmFormAction ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
