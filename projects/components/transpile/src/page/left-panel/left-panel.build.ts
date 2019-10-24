import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'aside';

register('wm-left-panel', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLeftPanel partialContainer data-role="page-left-panel" role="complementary" wmSmoothscroll="${attrs.get('smoothscroll') || 'true'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/page',
            name: 'PageModule'
        },{
            from: '@wm/components/page/left-panel',
            name: 'LeftPanelModule'
        }]
    };
});

export default () => {};
