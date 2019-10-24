import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-gridcolumn', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLayoutGridColumn ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/containers/layout-grid',
            name: 'LayoutGridModule'
        }]
    };
});

export default () => {};
