import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-dialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDialog ${getAttrMarkup(attrs)} aria-modal="true" role="dialog" wm-navigable-element="true"><ng-template #dialogBody>`,
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
