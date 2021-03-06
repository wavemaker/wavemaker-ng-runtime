import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-page-content', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPageContent wmSmoothscroll="${attrs.get('smoothscroll') || 'false'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
