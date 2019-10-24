import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'li';

register('wm-nav-item', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNavItem role="presentation" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/basic',
            name: 'BasicModule'
        },{
            from: '@wm/components/navigation/nav',
            name: 'NavModule'
        }]
    };
});

export default () => {};
