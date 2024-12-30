import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-wizardaction', (): IBuildTaskDef => {
    return {
        pre: attrs => `<ng-template #wizardAction><${tagName} wmWizardAction ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}></ng-template>`
    };
});

export default () => {};
