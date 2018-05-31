import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-wizard', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmWizard ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};