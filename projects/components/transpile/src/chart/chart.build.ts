import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-chart', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmChart redrawable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
