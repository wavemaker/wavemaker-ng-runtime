import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'aside';

register('wm-right-panel', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRightPanel partialContainer data-role="page-right-panel" role="complementary" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/page/right-panel',
            name: 'RightPanelModule'
        }]
    };
});

export default () => {};
