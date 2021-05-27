import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'aside';

register('wm-left-panel', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLeftPanel partialContainer data-role="page-left-panel" role="complementary" wmSmoothscroll="${attrs.get('smoothscroll') || 'false'}" aria-label="${attrs.get('hint') || 'Left navigation panel'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
