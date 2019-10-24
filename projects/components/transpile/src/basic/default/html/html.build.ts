import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-html', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmHtml ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/basic',
            name: 'BasicModule'
        }]
    };
});

export default () => {};
