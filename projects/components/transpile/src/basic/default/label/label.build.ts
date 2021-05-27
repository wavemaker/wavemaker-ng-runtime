import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'label';

register('wm-label', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLabel aria-label=${attrs.get('hint') || 'Label text'} ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
