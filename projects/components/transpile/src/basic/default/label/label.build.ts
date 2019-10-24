import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'label';

register('wm-label', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLabel ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/basic',
            name: 'BasicModule'
        }]
    };
});

export default () => {};
