import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-card-actions', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCardActions ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/data/card',
            name: 'CardModule'
        }]
    };
});

export default () => {};
