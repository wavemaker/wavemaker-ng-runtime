import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'section';

register('wm-top-nav', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTopNav partialContainer data-role="page-topnav" role="region" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/page/top-nav',
            name: 'TopNavModule'
        }]
    };
});

export default () => {};
