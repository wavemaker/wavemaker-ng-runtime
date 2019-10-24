import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-gridrow', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLayoutGridRow ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/containers/layout-grid',
            name: 'LayoutGridModule'
        }]
    };
});

export default () => {};
