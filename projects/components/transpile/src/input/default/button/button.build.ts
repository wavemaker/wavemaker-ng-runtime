import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'button';

register('wm-button', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmButton ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/input',
            name: 'InputModule'
        }]
    };
});

export default () => {};
