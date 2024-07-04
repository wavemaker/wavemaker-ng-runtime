import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-custom-widget-prop', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmProp hidden ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
