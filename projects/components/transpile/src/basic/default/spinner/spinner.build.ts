import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-spinner', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSpinner role="loading" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/basic',
            name: 'BasicModule'
        }]
    };
});

export default () => {};
