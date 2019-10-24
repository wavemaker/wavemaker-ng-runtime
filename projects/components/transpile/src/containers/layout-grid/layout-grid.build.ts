import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-layoutgrid', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLayoutGrid ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/containers/layout-grid',
            name: 'LayoutGridModule'
        }]
    };
});

export default () => {};
