import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-logindialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDialog wmLoginDialog ${getAttrMarkup(attrs)} eventsource.bind="Actions.loginAction" wm-navigable-element="true"><ng-template #dialogBody>`,
        post: () => `</ng-template></${tagName}>`,
        imports: [{
            from: 'ngx-bootstrap/modal',
            name: 'ModalModule',
            as: 'ngx_ModalModule',
            forRoot: true
        },{
            from: '@wm/components/input',
            name: 'InputModule'
        },{
            from: '@wm/components/dialogs',
            name: 'DialogModule'
        },{
            from: '@wm/components/dialogs/design-dialog',
            name: 'DesignDialogModule'
        },{
            from: '@wm/components/dialogs/login-dialog',
            name: 'LoginDialogModule'
        }]
    };
});

export default () => {};
