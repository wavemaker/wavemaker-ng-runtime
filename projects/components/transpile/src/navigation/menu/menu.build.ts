import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-menu', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMenu dropdown ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: 'ngx-bootstrap/dropdown',
            name: 'BsDropdownModule',
            as: 'ngxBsDropdownModule'
        }, {
            from: '@wm/components/navigation/menu',
            name: 'MenuModule'
        },{
            from: '@wm/components/navigation/nav',
            name: 'NavModule'
        }]
    };
});

export default () => {};
