import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'button';

register('wm-button', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmButton aria-label="${attrs.get('hint') || attrs.get('caption') || 'Button'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
