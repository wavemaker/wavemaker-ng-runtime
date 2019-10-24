import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'header';

register('wm-header', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmHeader partialContainer data-role="page-header" role="banner" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/page/header',
            name: 'HeaderModule'
        }]
    };
});

export default () => {};
