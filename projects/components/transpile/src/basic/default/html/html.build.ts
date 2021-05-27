import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-html', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmHtml aria-label=${attrs.get('hint') || 'HTML content'} ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
