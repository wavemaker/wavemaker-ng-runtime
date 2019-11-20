import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'header';

register('wm-mobile-navbar', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMobileNavbar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/mobile/components/mobile-navbar',
            name: 'MobileNavbarModule'
        }]
    };
});

export default () => {};
