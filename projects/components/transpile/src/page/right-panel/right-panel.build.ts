import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'aside';

register('wm-right-panel', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRightPanel partialContainer data-role="page-right-panel" role="complementary" aria-label="${attrs.get('hint') || 'Right navigation panel'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
