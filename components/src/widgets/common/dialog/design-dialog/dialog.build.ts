import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

// add wmDialogBody tag, wm-footer should close this
register('wm-dialog', (): IBuildTaskDef => {
    return {
        provide: () => new Map([['isDesignDialog', true]]),
        pre: attrs => `<${tagName} wmDialog ${getAttrMarkup(attrs)}><ng-template><div wmDialogBody>`,
        post: () => `</ng-template></${tagName}>`
    };
});

// Todo:vinay remove wm-view in migration
register('wm-view', (): IBuildTaskDef => {
    return {
        pre: attrs => '',
        post: () => ''
    };
});

export default () => {};
