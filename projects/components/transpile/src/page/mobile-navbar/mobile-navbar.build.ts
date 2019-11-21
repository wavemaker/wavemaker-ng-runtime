import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'header';

register('wm-mobile-navbar', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMobileNavbar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/page',
            name: 'PageModule'
        },{
            from: '@wm/components/page/left-panel',
            name: 'LeftPanelModule'
        },{
            from: '@wm/components/basic/search',
            name: 'SearchModule'
        },{
            from: '@wm/mobile/components/page/mobile-navbar',
            name: 'MobileNavbarModule'
        }]
    };
});

export default () => {};
