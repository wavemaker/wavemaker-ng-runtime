import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-form-group', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmFormGroup role="group" ${getAttrMarkup(attrs)}>`,
    post: () => `</${tagName}>`
};
});

// Todo[Vinay] remove this after the migration
register('wm-composite', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmFormGroup role="group" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};