import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-page-content', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPageContent wmSmoothscroll="${attrs.get('smoothscroll') || 'true'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/page',
            name: 'PageModule'
        }]
    };
});

export default () => {};
