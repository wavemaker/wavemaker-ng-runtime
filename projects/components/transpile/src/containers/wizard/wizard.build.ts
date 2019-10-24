import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-wizard', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmWizard role="tablist" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/containers/wizard',
            name: 'WizardModule'
        }]
    };
});

export default () => {};
