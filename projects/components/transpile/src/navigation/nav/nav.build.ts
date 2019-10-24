import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-nav', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNav data-element-type="wmNav" data-role="page-header" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/navigation/nav',
            name: 'NavModule'
        }]
    };
});

export default () => {};
