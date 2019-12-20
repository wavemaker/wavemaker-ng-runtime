import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-card', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCard ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: 'ngx-bootstrap/dropdown',
            name: 'BsDropdownModule',
            as: 'ngxBsDropdownModule',
            forRoot: true
        },{
            from: '@wm/components/data/card',
            name: 'CardModule'
        }]
    };
});

export default () => {};
