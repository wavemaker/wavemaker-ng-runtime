import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-form-group', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmFormGroup role="group" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};