import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-widget-template', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmWidgetTemplate ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
