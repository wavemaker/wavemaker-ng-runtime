import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-buttongroup', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmButtonGroup role="group" aria-labelledby="button group" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};