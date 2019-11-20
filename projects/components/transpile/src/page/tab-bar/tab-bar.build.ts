import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-mobile-tabbar', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMobileTabbar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/mobile/components/tab-bar',
            name: 'TabbarModule'
        }]
    };
});

export default () => {};
