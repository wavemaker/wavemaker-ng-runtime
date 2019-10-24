import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-card-footer', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCardFooter ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/data/card',
            name: 'CardModule'
        }]
    };
});

export default () => {};
