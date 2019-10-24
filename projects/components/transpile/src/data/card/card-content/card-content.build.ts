import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-card-content', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCardContent partialContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/data/card',
            name: 'CardModule'
        }]
    };
});

export default () => {};
