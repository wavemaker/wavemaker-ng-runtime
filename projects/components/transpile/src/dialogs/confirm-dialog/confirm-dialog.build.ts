import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-confirmdialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmConfirmDialog wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/input',
            name: 'InputModule'
        },{
            from: '@wm/components/dialogs/confirm-dialog',
            name: 'ConfirmDialogModule'
        }]
    };
});

export default () => {};
