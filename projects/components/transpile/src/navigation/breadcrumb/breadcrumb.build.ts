import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ol';

register('wm-breadcrumb', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmBreadcrumb ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/navigation/breadcrumb',
            name: 'BreadcrumbModule'
        },{
            from: '@wm/components/navigation/nav',
            name: 'NavModule'
        }]
    };
});

export default () => {};
