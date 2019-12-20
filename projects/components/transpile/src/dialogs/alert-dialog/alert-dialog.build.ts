import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-alertdialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAlertDialog role="alertdialog" wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: 'ngx-bootstrap/modal',
            name: 'ModalModule',
            as: 'ngx_ModalModule',
            forRoot: true
        }, {
            from: '@wm/components/input',
            name: 'InputModule'
        },{
            from: '@wm/components/dialogs',
            name: 'DialogModule'
        },{
            from: '@wm/components/dialogs/alert-dialog',
            name: 'AlertDialogModule'
        }]
    };
});

export default () => {};
