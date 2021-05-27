import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'button';

register('wm-button', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmButton aria-label="${attrs.get('hint') || 'Button'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
