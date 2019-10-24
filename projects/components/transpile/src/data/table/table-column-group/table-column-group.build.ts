import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-table-column-group', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTableColumnGroup ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/data/table',
            name: 'TableModule'
        }]
    };
});

export default () => {};
