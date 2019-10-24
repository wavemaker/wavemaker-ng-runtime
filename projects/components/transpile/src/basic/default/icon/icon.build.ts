import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'span';

register('wm-icon', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmIcon aria-hidden="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/basic',
            name: 'BasicModule'
        }]
    };
});

export default () => {};
