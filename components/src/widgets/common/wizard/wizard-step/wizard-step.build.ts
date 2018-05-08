import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'form';

register('wm-wizardstep', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmWizardStep ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};