import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-iframedialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmIframeDialog wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
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
            from: '@wm/components/dialogs/iframe-dialog',
            name: 'IframeDialogModule'
        }]
    };
});

export default () => {};
